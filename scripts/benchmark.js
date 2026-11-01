/**
 * Measures the four templates the way a user meets them, for before/after comparisons.
 *
 *   node scripts/benchmark.js --label baseline --out <dir>     writes <label>.json and <label>.md
 *   node scripts/benchmark.js --compare <a.json> <b.json>      prints a comparison table
 *   --only <text>                                              only templates whose name contains <text>
 *   --runs <n>                                                 runs per command (default 7; install, build and dev use at most 5)
 *
 * Every command runs one at a time and cold (caches removed first). A discarded warm-up run
 * fills the OS file cache. Wall and CPU time are both stored: wall is what the user feels,
 * CPU time is far less sensitive to whatever else the machine is doing. Differences inside
 * the wall-time min-max range of either side are reported as noise.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "bin", "virastack.js");
const LIGHTHOUSE = "lighthouse@13.6.0";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TEMPLATES = [
  { name: "nextjs", template: "nextjs", i18n: false, page: "/" },
  { name: "tanstack", template: "tanstack", i18n: false, page: "/" },
  { name: "nextjs-i18n", template: "nextjs", i18n: true, page: "/en" },
  { name: "tanstack-i18n", template: "tanstack", i18n: true, page: "/en" },
];
const ENV = {
  ...process.env,
  CI: "1",
  NEXT_TELEMETRY_DISABLED: "1",
  VIRASTACK_TELEMETRY_DISABLED: "1",
  npm_config_user_agent: "pnpm/10.0.0 npm/? node/? darwin arm64",
};

function arg(name, fallback) {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

function summarize(samples) {
  const wall = samples.map((sample) => sample.wall);
  const summary = { median: median(wall), min: Math.min(...wall), max: Math.max(...wall), runs: wall.length };
  const cpu = samples.map((sample) => sample.cpu).filter((value) => value != null);
  if (cpu.length) summary.cpu = median(cpu);
  const rss = samples.map((sample) => sample.rss).filter((value) => value != null);
  if (rss.length) summary.rssMb = Math.round(median(rss) / 1024 / 1024);
  return summary;
}

/** Runs through `/usr/bin/time -l`, which reports wall, CPU and the largest process's memory. */
function timed(command, args, cwd) {
  const start = process.hrtime.bigint();
  const result = spawnSync("/usr/bin/time", ["-l", command, ...args], { cwd, env: ENV, encoding: "utf8", maxBuffer: 2 ** 28 });
  const wall = Number(process.hrtime.bigint() - start) / 1e9;
  const times = result.stderr.match(/([\d.]+) real\s+([\d.]+) user\s+([\d.]+) sys/);
  const rss = result.stderr.match(/(\d+)\s+maximum resident set size/);
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with ${result.status}\n${`${result.stdout}${result.stderr}`.slice(-1500)}`);
  }
  return { wall, cpu: times ? Number(times[2]) + Number(times[3]) : null, rss: rss ? Number(rss[1]) : null };
}

function repeat(runs, prepare, command, args, cwd) {
  prepare();
  timed(command, args, cwd);
  const samples = [];
  for (let i = 0; i < runs; i++) {
    prepare();
    samples.push(timed(command, args, cwd));
  }
  return summarize(samples);
}

function removeAll(dir, names) {
  for (const name of names) {
    rmSync(path.join(dir, name), { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
  for (const entry of readdirSync(dir)) {
    if (entry.endsWith(".tsbuildinfo")) rmSync(path.join(dir, entry));
  }
}

function walk(dir, visit) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else visit(full);
  }
}

function assetSizes(dir) {
  const totals = { jsKb: 0, jsGzipKb: 0, cssKb: 0, cssGzipKb: 0 };
  walk(dir, (file) => {
    const kind = file.endsWith(".js") ? "js" : file.endsWith(".css") ? "css" : null;
    if (!kind) return;
    const content = readFileSync(file);
    totals[`${kind}Kb`] += content.length / 1024;
    totals[`${kind}GzipKb`] += gzipSync(content).length / 1024;
  });
  return Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, Math.round(value)]));
}

function directoryMb(dir) {
  const result = spawnSync("du", ["-sk", dir], { encoding: "utf8" });
  return Math.round(Number(result.stdout.split("\t")[0]) / 1024);
}

function startServer(args, cwd) {
  return spawn("pnpm", ["exec", ...args], { cwd, env: ENV, detached: true, stdio: "ignore" });
}

async function stopServer(server) {
  const closed = new Promise((resolve) => server.once("close", resolve));
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    return;
  }
  await closed;
  // `pnpm exec` exits before its children; a cold start next must not meet a process still writing caches.
  for (let waited = 0; ; waited += 50) {
    try {
      process.kill(-server.pid, waited >= 5000 ? "SIGKILL" : 0);
    } catch {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function waitForPage(url, timeoutMs = 120000) {
  const start = process.hrtime.bigint();
  while (Number(process.hrtime.bigint() - start) / 1e6 < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await response.text();
        return Number(process.hrtime.bigint() - start) / 1e9;
      }
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`${url} did not answer within ${timeoutMs} ms`);
}

async function measureDev(item, dir, port, runs) {
  const args = item.template === "nextjs" ? ["next", "dev", "-p", String(port)] : ["vite", "dev", "--port", String(port)];
  const samples = [];
  for (let i = 0; i <= runs; i++) {
    removeAll(dir, [".next", "node_modules/.vite"]);
    const server = startServer(args, dir);
    const wall = await waitForPage(`http://localhost:${port}${item.page}`);
    await stopServer(server);
    if (i > 0) samples.push({ wall });
  }
  return summarize(samples);
}

function lighthouse(url, file) {
  const result = spawnSync(
    "npx",
    ["--yes", LIGHTHOUSE, url, "--quiet", "--only-categories=performance", "--output=json", `--output-path=${file}`, "--chrome-flags=--headless=new"],
    { env: { ...ENV, CHROME_PATH: CHROME }, encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(`Lighthouse failed:\n${result.stderr.slice(-800)}`);
  const report = JSON.parse(readFileSync(file, "utf8"));
  const audit = (id) => report.audits[id].numericValue;
  return {
    score: Math.round(report.categories.performance.score * 100),
    fcpMs: audit("first-contentful-paint"),
    lcpMs: audit("largest-contentful-paint"),
    tbtMs: audit("total-blocking-time"),
    cls: audit("cumulative-layout-shift"),
    transferKb: audit("total-byte-weight") / 1024,
  };
}

async function measureProduction(item, dir, port, runs, work) {
  const args = item.template === "nextjs" ? ["next", "start", "-p", String(port)] : ["vite", "preview", "--port", String(port)];
  const url = `http://localhost:${port}${item.page}`;
  const server = startServer(args, dir);
  try {
    await waitForPage(url);
    const responses = [];
    for (let i = 0; i < 100; i++) {
      const start = process.hrtime.bigint();
      await (await fetch(url)).text();
      if (i >= 20) responses.push(Number(process.hrtime.bigint() - start) / 1e6);
    }
    const file = path.join(work, `${item.name}-lighthouse.json`);
    lighthouse(url, file);
    const reports = [];
    for (let i = 0; i < runs; i++) reports.push(lighthouse(url, file));
    const pick = (key) => median(reports.map((report) => report[key]));
    return {
      responseMs: Number(median(responses).toFixed(2)),
      lighthouse: {
        runs,
        score: pick("score"),
        scoreMin: Math.min(...reports.map((report) => report.score)),
        scoreMax: Math.max(...reports.map((report) => report.score)),
        fcpMs: Math.round(pick("fcpMs")),
        lcpMs: Math.round(pick("lcpMs")),
        tbtMs: Math.round(pick("tbtMs")),
        cls: Number(pick("cls").toFixed(3)),
        transferKb: Math.round(pick("transferKb")),
      },
    };
  } finally {
    await stopServer(server);
  }
}

async function measureTemplate(item, work, port, runs) {
  console.log(`\n${item.name}`);
  const initArgs = (name, extra = []) => [CLI, "init", name, "--template", item.template, item.i18n ? "--i18n" : "--no-i18n", "--agent", "none", "--yes", ...extra];
  const dir = path.join(work, item.name);
  const step = (label) => console.log(`  ${label}`);
  const result = {};

  step("scaffold");
  const scaffolds = [];
  for (let i = 0; i <= 3; i++) {
    const name = `${item.name}-scaffold-${i}`;
    const sample = timed(process.execPath, initArgs(name, ["--skip-install"]), work);
    if (i > 0) scaffolds.push(sample);
    rmSync(path.join(work, name), { recursive: true, force: true });
  }
  result.scaffold = summarize(scaffolds);

  step("first install through the CLI");
  const first = timed(process.execPath, initArgs(item.name), work);
  result.initWithInstall = { wall: first.wall, cpu: first.cpu, runs: 1 };
  if (!existsSync(path.join(dir, "node_modules"))) throw new Error(`${item.name}: dependency install failed`);

  const packageJson = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"));
  const lockfile = readFileSync(path.join(dir, "pnpm-lock.yaml"), "utf8");
  result.sizes = {
    nodeModulesMb: directoryMb(dir + "/node_modules"),
    directDependencies: Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).length,
    lockedPackages: (lockfile.split(/^packages:$/m)[1]?.split(/^snapshots:$/m)[0].match(/^ {2}\S/gm) ?? []).length,
  };
  const installed = (name) => {
    const file = path.join(dir, "node_modules", name, "package.json");
    return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")).version : null;
  };
  result.versions = Object.fromEntries(
    ["next", "react", "vite", "typescript", "@typescript/native", "eslint", "vitest", "@tanstack/react-start", "tailwindcss"]
      .map((name) => [name, installed(name)])
      .filter(([, version]) => version),
  );

  const commands = [
    ["install", ["node_modules"], "pnpm", ["install", "--frozen-lockfile", "--prefer-offline"], Math.min(runs, 5)],
    ["typecheck", [], "pnpm", ["run", "typecheck"], runs],
    ["lint", [".eslintcache"], "pnpm", ["run", "lint"], runs],
    ["knip", [".knip"], "pnpm", ["run", "knip"], runs],
    ["test", [], "pnpm", ["run", "test"], runs],
    ["build", [".next", "dist", ".output"], "pnpm", ["run", "build"], Math.min(runs, 5)],
  ];
  for (const [label, cache, command, args, count] of commands) {
    step(label);
    result[label] = repeat(count, () => removeAll(dir, cache), command, args, dir);
  }

  result.assets = assetSizes(item.template === "nextjs" ? path.join(dir, ".next/static") : path.join(dir, "dist/client"));

  step("production server and Lighthouse");
  const production = await measureProduction(item, dir, port, 5, work);
  result.responseMs = production.responseMs;
  result.lighthouse = production.lighthouse;

  step("dev server");
  result.devFirstPage = await measureDev(item, dir, port + 1, Math.min(runs, 5));
  timed("pnpm", ["run", "build"], dir);
  return result;
}

function environment() {
  const out = (command, args) => spawnSync(command, args, { encoding: "utf8" }).stdout.trim();
  return {
    date: new Date().toISOString(),
    commit: out("git", ["-C", ROOT, "rev-parse", "--short", "HEAD"]),
    dirty: out("git", ["-C", ROOT, "status", "--porcelain", "--", "templates", "templates-i18n", "src"]).length > 0,
    cpu: os.cpus()[0].model,
    cores: os.cpus().length,
    memoryGb: Math.round(os.totalmem() / 1024 ** 3),
    node: process.version,
    pnpm: out("pnpm", ["--version"]),
    power: out("pmset", ["-g", "batt"]).split("\n")[0],
    lighthouse: LIGHTHOUSE,
  };
}

const seconds = (value) => value.toFixed(2);

function toMarkdown(report) {
  const lines = [
    `# Start benchmark: ${report.label}`,
    "",
    `${report.environment.date}, commit \`${report.environment.commit}\`${report.environment.dirty ? " (uncommitted changes)" : ""}.`,
    `${report.environment.cpu}, ${report.environment.cores} cores, ${report.environment.memoryGb} GB, Node ${report.environment.node}, pnpm ${report.environment.pnpm}. ${report.environment.power}.`,
    `Load average: start ${report.load.start.join(" / ")}, end ${report.load.end.join(" / ")}.`,
    "",
    "## Commands (seconds, cold)",
    "",
    "Median wall time, with the min-max range and median CPU time.",
    "",
    "| Template | Command | Wall | Range | CPU | Memory (MB) | Runs |",
    "|---|---|---|---|---|---|---|",
  ];
  const labels = ["scaffold", "install", "typecheck", "lint", "knip", "test", "build", "devFirstPage"];
  for (const [name, result] of Object.entries(report.templates)) {
    for (const label of labels) {
      const row = result[label];
      lines.push(`| ${name} | ${label} | ${seconds(row.median)} | ${seconds(row.min)}-${seconds(row.max)} | ${row.cpu != null ? seconds(row.cpu) : "-"} | ${row.rssMb ?? "-"} | ${row.runs} |`);
    }
  }
  lines.push("", "## Runtime", "", "Production server on localhost, Lighthouse with mobile throttling, 5 runs.", "");
  lines.push("| Template | Score (range) | FCP ms | LCP ms | TBT ms | CLS | Page weight KB | Response ms |", "|---|---|---|---|---|---|---|---|");
  for (const [name, result] of Object.entries(report.templates)) {
    const l = result.lighthouse;
    lines.push(`| ${name} | ${l.score} (${l.scoreMin}-${l.scoreMax}) | ${l.fcpMs} | ${l.lcpMs} | ${l.tbtMs} | ${l.cls} | ${l.transferKb} | ${result.responseMs} |`);
  }
  lines.push("", "## Size", "");
  lines.push("| Template | JS gzip KB | CSS gzip KB | node_modules MB | Direct deps | Locked packages |", "|---|---|---|---|---|---|");
  for (const [name, result] of Object.entries(report.templates)) {
    lines.push(`| ${name} | ${result.assets.jsGzipKb} | ${result.assets.cssGzipKb} | ${result.sizes.nodeModulesMb} | ${result.sizes.directDependencies} | ${result.sizes.lockedPackages} |`);
  }
  lines.push("", "## Versions", "");
  for (const [name, result] of Object.entries(report.templates)) {
    lines.push(`- ${name}: ${Object.entries(result.versions).map(([pkg, version]) => `${pkg} ${version}`).join(", ")}`);
  }
  return `${lines.join("\n")}\n`;
}

function compare(fileA, fileB) {
  const a = JSON.parse(readFileSync(fileA, "utf8"));
  const b = JSON.parse(readFileSync(fileB, "utf8"));
  const labels = ["scaffold", "install", "typecheck", "lint", "knip", "test", "build", "devFirstPage"];
  console.log(`| Template | Command | ${a.label} | ${b.label} | Change | CPU change | Verdict |`);
  console.log("|---|---|---|---|---|---|---|");
  for (const name of Object.keys(a.templates)) {
    if (!b.templates[name]) continue;
    for (const label of labels) {
      const before = a.templates[name][label];
      const after = b.templates[name][label];
      const change = ((after.median - before.median) / before.median) * 100;
      const cpuChange = before.cpu && after.cpu ? `${(((after.cpu - before.cpu) / before.cpu) * 100).toFixed(0)}%` : "-";
      const noise = after.median >= before.min && after.median <= before.max;
      const overlap = before.min <= after.max && after.min <= before.max;
      console.log(`| ${name} | ${label} | ${seconds(before.median)} s | ${seconds(after.median)} s | ${change.toFixed(0)}% | ${cpuChange} | ${noise || overlap ? "noise" : change < 0 ? "faster" : "slower"} |`);
    }
  }
}

async function main() {
  if (process.argv.includes("--compare")) {
    const index = process.argv.indexOf("--compare");
    compare(process.argv[index + 1], process.argv[index + 2]);
    return;
  }
  const label = arg("--label", "run");
  const out = path.resolve(arg("--out", "."));
  const only = arg("--only", "");
  const runs = Number(arg("--runs", "7"));
  mkdirSync(out, { recursive: true });
  const work = mkdtempSync(path.join(os.tmpdir(), "virastack-benchmark-"));
  const report = { label, environment: environment(), load: { start: os.loadavg().map((v) => Number(v.toFixed(2))) }, templates: {} };
  let port = 4100;
  try {
    for (const item of TEMPLATES.filter((template) => template.name.includes(only))) {
      report.templates[item.name] = await measureTemplate(item, work, port, runs);
      port += 2;
      // Saved after each template so an interrupted run keeps what it measured.
      writeFileSync(path.join(out, `${label}.json`), `${JSON.stringify(report, null, 2)}\n`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  report.load.end = os.loadavg().map((v) => Number(v.toFixed(2)));
  writeFileSync(path.join(out, `${label}.json`), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(path.join(out, `${label}.md`), toMarkdown(report));
  console.log(`\nSaved ${path.join(out, `${label}.md`)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
