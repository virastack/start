/**
 * End-to-end check of `virastack init` with ViraStack AI.
 *
 *   node scripts/e2e.js            16 runs: 2 templates x i18n on/off x 4 agent choices,
 *                                  with --skip-install (files, git, agent folders and skills)
 *   node scripts/e2e.js --full     4 runs with install, skills, typecheck, lint:ci and test, then
 *                                  for each module of the template: `add`, the same checks and a
 *                                  build with its own pages (or, without any, with the page the
 *                                  site tells people to write), then `remove`. A module with pages
 *                                  also gets a route collision, HTTP checks on the built server
 *                                  (visible server HTML, real 404s), `add --no-pages` with a
 *                                  typecheck, and `remove` with a changed page. Every `remove`
 *                                  has to leave the project as it was
 *   --only <text>                  only runs whose name contains <text> (e.g. tanstack-i18n)
 *
 * Set VIRASTACK_AI_SPEC to test an unpublished ViraStack AI (e.g. file:/path/to.tgz
 * from `npm pack`); otherwise the published channel is used.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FEATURES } from "./build-registry.js";
import { buildFeatureRoute } from "./feature-route.ts";
import { visibleText } from "./visible-text.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "bin", "virastack.js");
const FULL = process.argv.includes("--full");
const onlyIndex = process.argv.indexOf("--only");
const ONLY = onlyIndex === -1 ? "" : process.argv[onlyIndex + 1];

const TEMPLATES = ["nextjs", "tanstack"];
const SKILLS = ["emil-design-eng", "better-ui", "better-accessibility"];
const AGENT_CHOICES = FULL ? ["claude,cursor"] : ["claude,cursor", "claude", "cursor", "none"];
// Each run builds its own registry, removed at the end, so two runs never share one.
const REGISTRY = mkdtempSync(path.join(os.tmpdir(), "virastack-e2e-registry-"));
spawnSync(process.execPath, [path.join(ROOT, "scripts/build-registry.js"), REGISTRY]);

const ENV = {
  ...process.env,
  VIRASTACK_REGISTRY_URL: REGISTRY,
  VIRASTACK_TELEMETRY_DISABLED: "1",
  npm_config_user_agent: "pnpm/12.16.1 npm/? node/? linux x64",
  CI: "1",
};

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, env: ENV, encoding: "utf8" });
  return { ok: result.status === 0, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

/** A port nothing listens on, from the system. */
function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, () => {
      const { port } = /** @type {import("node:net").AddressInfo} */ (probe.address());
      probe.close(() => resolve(port));
    });
  });
}

/**
 * Starts the built app, as its own `start` would, and checks that the server renders the module's
 * pages: visible text in the HTML (not waiting for a script in a hidden element), the order a sort
 * gives, and real 404s. The i18n templates are also asked under `/tr`.
 */
async function checkServer(dir, { template, i18n, e2e }, expect) {
  const port = await freePort();
  const args =
    template === "nextjs"
      ? ["exec", "next", "start", "-p", String(port)]
      : ["exec", "vite", "preview", "--port", String(port), "--strictPort"];
  const server = spawn("pnpm", args, { cwd: dir, env: ENV, stdio: "ignore", detached: true });
  const exited = new Promise((resolve) => server.once("exit", resolve));
  const base = `http://localhost:${port}`;
  const get = async (url) => {
    const response = await fetch(`${base}${url}`, { headers: { "user-agent": "Mozilla/5.0 Chrome/140" } });
    const html = await response.text();
    return { status: response.status, html, text: visibleText(html) };
  };
  try {
    let ready = false;
    for (let attempt = 0; attempt < 60 && !ready; attempt += 1) {
      ready = await fetch(base).then(() => true, () => false);
      if (!ready) await new Promise((resolve) => setTimeout(resolve, 500));
    }
    expect(ready, `the ${template} server did not start on port ${port}`);
    if (!ready) return;
    for (const prefix of i18n ? ["", "/tr"] : [""]) {
      for (const { path: url, text, before, absent, localized } of e2e.pages) {
        // UI text, not data: on the `/tr` page the `tr` check below looks for its Turkish.
        if (prefix && localized) continue;
        const page = await get(`${prefix}${url}`);
        const at = page.text.indexOf(text);
        expect(page.status === 200 && at !== -1, `GET ${prefix}${url}: ${page.status}, "${text}" ${at === -1 ? "not " : ""}in the visible HTML`);
        if (before) {
          const later = page.text.indexOf(before);
          expect(later > at, `GET ${prefix}${url}: "${text}" should come before "${before}"`);
        }
        if (absent) expect(!page.text.includes(absent), `GET ${prefix}${url}: "${absent}" should not be there`);
      }
      for (const url of e2e.missing) {
        const page = await get(`${prefix}${url}`);
        expect(page.status === 404, `GET ${prefix}${url}: ${page.status}, expected 404`);
        if (e2e.notFound) {
          // Next.js puts a 404 thrown while rendering only in the page's payload, which the browser
          // renders; TanStack Start renders it into the HTML. Either way it is in the response.
          const text = prefix && e2e.tr ? e2e.tr.notFound : e2e.notFound.text;
          const link = `${prefix}${e2e.notFound.link}`;
          const hasLink = page.html.includes(`href="${link}"`) || page.html.includes(`\\"href\\":\\"${link}\\"`);
          expect(page.html.includes(text) && hasLink, `GET ${prefix}${url}: no "${text}" with a link to ${link}`);
        }
      }
    }
    // The price a card shows as current is the one the list sorts by.
    for (const { path: url, order } of e2e.sorted ?? []) {
      const page = await get(url);
      const prices = [...page.text.matchAll(/(?:Sale price|Price) \$([\d,]+\.\d\d)/g)].map(([, price]) => Number(price.replaceAll(",", "")));
      const sorted = prices.every((price, index) => index === 0 || (order === "asc" ? price >= prices[index - 1] : price <= prices[index - 1]));
      expect(prices.length > 1 && sorted, `GET ${url}: prices out of order: ${prices.join(", ")}`);
    }
    // Meta and structured data are read from the raw HTML, by crawlers and share previews.
    const heads = [...(e2e.head ?? []), ...(i18n && e2e.tr?.head ? [e2e.tr.head] : [])];
    for (const { path: url, includes } of heads) {
      const { html } = await get(url);
      for (const text of includes) expect(html.includes(text), `GET ${url}: no ${text} in the HTML`);
    }
    if (i18n && e2e.tr) {
      const [first] = e2e.pages;
      const page = await get(`/tr${first.path}`);
      expect(page.text.includes(e2e.tr.text), `GET /tr${first.path}: no "${e2e.tr.text}" in the visible HTML`);
      expect(/<html[^>]*\slang="tr"/.test(page.html), `GET /tr${first.path}: the page is not lang="tr"`);
      if (e2e.tr.link) {
        expect(page.html.includes(`href="${e2e.tr.link}`), `GET /tr${first.path}: no link starting with ${e2e.tr.link}`);
      }
    }
  } finally {
    if (server.pid) process.kill(-server.pid, "SIGTERM");
    // The next run builds over the same files, so this one has to be gone first.
    await exited;
  }
}

async function checkProject(dir, { agents, template, i18n }) {
  const errors = [];
  const expect = (condition, message) => condition || errors.push(message);
  const has = (file) => existsSync(path.join(dir, file));

  const status = run("git", ["status", "--porcelain"], dir);
  expect(status.ok && status.output.trim() === "", `git status not clean:\n${status.output}`);
  const log = run("git", ["log", "--oneline"], dir);
  expect(log.ok && log.output.trim().split("\n").length === 1, "expected exactly one commit");
  const tracked = run("git", ["ls-files"], dir).output;
  expect(tracked.includes(".virastack/ai.json"), "ai manifest not committed");

  const claude = agents.includes("claude");
  const cursor = agents.includes("cursor");
  expect(has(".claude/rules/virastack") === claude, `.claude/rules ${claude ? "missing" : "unexpected"}`);
  expect(has("CLAUDE.md") === claude, `CLAUDE.md ${claude ? "missing" : "unexpected"}`);
  expect(has(".cursor/rules/virastack") === cursor, `.cursor/rules ${cursor ? "missing" : "unexpected"}`);
  expect(has(".agents/rules/virastack") === (agents.length === 0), ".agents/rules does not match --agent none");

  const agentsMd = has("AGENTS.md") ? readFileSync(path.join(dir, "AGENTS.md"), "utf8") : "";
  expect(agentsMd.includes("BEGIN:virastack-ai"), "AGENTS.md has no ViraStack AI block");
  // Next.js owns this block: `next dev` writes it when it detects a coding agent.
  expect(!agentsMd.includes("BEGIN:nextjs-agent-rules"), "the CLI wrote the Next.js block");

  // `.agents/skills` would go unused with Claude Code alone, so the CLI skips it.
  const claudeOnly = agents.length === 1 && claude;

  for (const skill of SKILLS) {
    expect(
      has(`.agents/skills/${skill}/SKILL.md`) === !claudeOnly,
      `${skill} ${claudeOnly ? "unexpected" : "missing"} in .agents/skills`,
    );
    const copy = path.join(dir, ".claude/skills", skill);
    if (claude) {
      expect(existsSync(copy) && !lstatSync(copy).isSymbolicLink(), `.claude/skills/${skill} missing or a symlink`);
    } else {
      expect(!existsSync(copy), `.claude/skills/${skill} unexpected`);
    }
  }

  if (FULL) {
    // A new project has no module; each module has to work in it and leave no trace.
    const checkScripts = () => {
      for (const script of ["typecheck", "lint:ci", "test"]) {
        const result = run("pnpm", ["run", script], dir);
        expect(result.ok, `pnpm run ${script} failed:\n${result.output.slice(-3000)}`);
      }
    };
    checkScripts();
    expect(!has("src/features/users"), "init installed the users module");

    // The routes `add` may touch, one line per file: the module's pages and the route tree.
    const routeChanges = () =>
      run("git", ["status", "--porcelain", "--untracked-files=all", "src/app", "src/routes", "src/routeTree.gen.ts"], dir)
        .output.split("\n")
        .map((line) => line.slice(3).trim())
        .filter(Boolean)
        .sort();
    const refreshRoutes = () => template === "tanstack" && run("pnpm", ["run", "generate-routes"], dir);
    // Packages and shadcn components stay after `remove`, because other code may use them.
    const removeAndCheck = (name, ui, label) => {
      const removed = run(process.execPath, [CLI, "remove", name], dir);
      expect(removed.ok, `remove ${name} failed:\n${removed.output.slice(-2000)}`);
      // In TanStack Start the route tree must list exactly the routes left, with no dev server.
      if (template === "tanstack") {
        const typed = run("pnpm", ["run", "typecheck"], dir);
        expect(typed.ok, `pnpm run typecheck after remove ${name} failed:\n${typed.output.slice(-3000)}`);
      }
      run("git", ["checkout", "--", "package.json", "pnpm-lock.yaml"], dir);
      for (const component of ui) rmSync(path.join(dir, "src/components/ui", `${component}.tsx`), { force: true });
      run("pnpm", ["install", "--frozen-lockfile"], dir);
      const left = run("git", ["status", "--porcelain", "--untracked-files=all"], dir).output.trim();
      expect(left === "", `remove ${name}${label} left changes:\n${left}`);
    };

    const framework = `${template}${i18n ? "-i18n" : ""}`;
    const modules = FEATURES.filter(({ frameworks }) => frameworks.includes(framework));
    expect(modules.length > 0, `no module ships for ${framework}`);
    const restorePackages = (ui) => {
      run("git", ["checkout", "--", "package.json", "pnpm-lock.yaml"], dir);
      for (const component of ui) rmSync(path.join(dir, "src/components/ui", `${component}.tsx`), { force: true });
      run("pnpm", ["install", "--frozen-lockfile"], dir);
    };
    const expectClean = (label) => {
      const left = run("git", ["status", "--porcelain", "--untracked-files=all"], dir).output.trim();
      expect(left === "", `${label} left changes:\n${left}`);
    };

    for (const { name, route, ui = [], e2e } of modules) {
      const item = JSON.parse(readFileSync(path.join(REGISTRY, `${name}-${framework}.json`), "utf8"));
      const pages = item.meta.pages ?? [];
      // A module brings its own route files (its pages and the files beside them, such as Next.js
      // `not-found.tsx`) and a route tree that lists them, or touches no route at all.
      const routeFiles = item.files.map(({ target }) => target).filter((target) => /^src\/(app|routes)\//.test(target));
      const expected = pages.length === 0 ? [] : [...routeFiles, ...(template === "tanstack" ? ["src/routeTree.gen.ts"] : [])].sort();

      const [list] = pages;
      if (list) {
        // Another route for the module's URL stops `add` before it writes anything.
        const collision = list.file.replace(/\/([^/]+)\/(page|index)\.tsx$/, "/(e2e)/$1/$2.tsx");
        mkdirSync(path.dirname(path.join(dir, collision)), { recursive: true });
        writeFileSync(path.join(dir, collision), "export default function Page() {\n  return null\n}\n");
        const stopped = run(process.execPath, [CLI, "add", name], dir);
        expect(!stopped.ok && stopped.output.includes(collision), `add ${name} did not stop on ${collision}:\n${stopped.output.slice(-1500)}`);
        rmSync(path.join(dir, collision.replace(/\(e2e\)\/.*$/, "(e2e)")), { recursive: true, force: true });
        expectClean(`add ${name} stopped by a route`);
      }

      const added = run(process.execPath, [CLI, "add", name], dir);
      expect(added.ok, `add ${name} failed:\n${added.output.slice(-2000)}`);
      expect(has(`src/features/${name}`), `add ${name} wrote no files`);
      const touched = routeChanges();
      expect(
        JSON.stringify(touched) === JSON.stringify(expected),
        `add ${name} changed these routes:\n${touched.join("\n")}\nexpected:\n${expected.join("\n")}`,
      );
      checkScripts();

      if (list) {
        const built = run("pnpm", ["run", "build"], dir);
        expect(built.ok, `pnpm run build with the ${name} pages failed:\n${built.output.slice(-3000)}`);
        if (built.ok && e2e) await checkServer(dir, { template, i18n, e2e }, expect);
        removeAndCheck(name, ui, "");

        // `--no-pages` installs the feature alone, for a project that has its own pages.
        const bare = run(process.execPath, [CLI, "add", name, "--no-pages"], dir);
        expect(bare.ok, `add ${name} --no-pages failed:\n${bare.output.slice(-2000)}`);
        expect(has(`src/features/${name}`), `add ${name} --no-pages wrote no files`);
        const bareRoutes = routeChanges();
        expect(bareRoutes.length === 0, `add ${name} --no-pages touched the routes:\n${bareRoutes.join("\n")}`);
        const typed = run("pnpm", ["run", "typecheck"], dir);
        expect(typed.ok, `pnpm run typecheck after add ${name} --no-pages failed:\n${typed.output.slice(-3000)}`);
        removeAndCheck(name, ui, " after --no-pages");

        // A page the reader changed stays on `remove`, which says so; the rest of the module goes.
        run(process.execPath, [CLI, "add", name], dir);
        writeFileSync(path.join(dir, list.file), `${readFileSync(path.join(dir, list.file), "utf8")}// mine\n`);
        const kept = run(process.execPath, [CLI, "remove", name, "--yes"], dir);
        expect(kept.ok && kept.output.includes(list.file) && existsSync(path.join(dir, list.file)) && !has(`src/features/${name}`),
          `remove ${name} with a changed page:\n${kept.output.slice(-1500)}`);
        rmSync(path.join(dir, path.dirname(list.file)), { recursive: true, force: true });
        refreshRoutes();
        restorePackages(ui);
        expectClean(`remove ${name} with a changed page`);
        continue;
      }

      // Not the module's default path: what the site shows has to work on any page.
      const { file, code } = buildFeatureRoute(route, { framework: template, i18n, path: "/team/members" });
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      writeFileSync(path.join(dir, file), code);
      refreshRoutes();
      checkScripts();
      const built = run("pnpm", ["run", "build"], dir);
      expect(built.ok, `pnpm run build with the ${name} page failed:\n${built.output.slice(-3000)}`);

      rmSync(path.join(dir, "src", template === "nextjs" ? "app" : "routes", ...(i18n ? [template === "nextjs" ? "[locale]" : "{-$lang}"] : []), "team"), { recursive: true, force: true });
      refreshRoutes();
      removeAndCheck(name, ui, "");
    }
  }
  return errors;
}

const work = mkdtempSync(path.join(os.tmpdir(), "virastack-e2e-"));
let failures = 0;

for (const template of TEMPLATES) {
  for (const i18n of [false, true]) {
    for (const agentFlag of AGENT_CHOICES) {
      const name = `${template}-${i18n ? "i18n" : "plain"}-${agentFlag.replace(",", "-")}`;
      if (!name.includes(ONLY)) continue;
      const args = [CLI, "init", name, "--template", template, i18n ? "--i18n" : "--no-i18n", "--agent", agentFlag, "--yes"];
      if (!FULL) args.push("--skip-install");
      const result = run(process.execPath, args, work);
      const agents = agentFlag === "none" ? [] : agentFlag.split(",");
      const errors = result.ok
        ? await checkProject(path.join(work, name), { agents, template, i18n })
        : [`CLI failed:\n${result.output.slice(-2000)}`];
      failures += errors.length > 0 ? 1 : 0;
      console.log(`${errors.length ? "FAIL" : "ok  "} ${name}`);
      for (const error of errors) console.log(`     ${error.replace(/\n/g, "\n     ")}`);
    }
  }
}

// `.` in a folder that already has agent files: the user's text must survive.
const existing = path.join(work, "existing");
const ownText = "# Team rules\n\nAlways write tests.\n";
rmSync(existing, { recursive: true, force: true });
spawnSync("mkdir", ["-p", existing]);
writeFileSync(path.join(existing, "AGENTS.md"), ownText);
writeFileSync(path.join(existing, "CLAUDE.md"), "Prefer small PRs.\n");
const dot = run(process.execPath, [CLI, "init", ".", "--template", "nextjs", "--no-i18n", "--yes", "--skip-install"], existing);
// ViraStack AI puts its `@AGENTS.md` import line above the existing CLAUDE.md text.
const keptAgents = readFileSync(path.join(existing, "AGENTS.md"), "utf8").startsWith(ownText);
const keptClaude = readFileSync(path.join(existing, "CLAUDE.md"), "utf8").endsWith("\n\nPrefer small PRs.\n");
const dotOk = dot.ok && keptAgents && keptClaude;
failures += dotOk ? 0 : 1;
console.log(`${dotOk ? "ok  " : "FAIL"} existing folder keeps AGENTS.md and CLAUDE.md`);

rmSync(work, { recursive: true, force: true });
rmSync(REGISTRY, { recursive: true, force: true });
console.log(failures ? `\n${failures} failed` : "\nall passed");
process.exitCode = failures ? 1 : 0;
