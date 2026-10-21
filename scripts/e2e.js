/**
 * End-to-end check of `virastack init` with ViraStack AI.
 *
 *   node scripts/e2e.js            16 runs: 2 templates x i18n on/off x 4 agent choices,
 *                                  with --skip-install (files, git and agent folders only)
 *   node scripts/e2e.js --full     4 runs with install, skills, typecheck, lint:ci and test
 *   --only <text>                  only runs whose name contains <text> (e.g. tanstack-i18n)
 *
 * Set VIRASTACK_AI_SPEC to test an unpublished ViraStack AI (e.g. file:/path/to.tgz
 * from `npm pack`); otherwise the published channel is used.
 */
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "bin", "virastack.js");
const FULL = process.argv.includes("--full");
const onlyIndex = process.argv.indexOf("--only");
const ONLY = onlyIndex === -1 ? "" : process.argv[onlyIndex + 1];

const TEMPLATES = ["nextjs", "tanstack"];
const AGENT_CHOICES = FULL ? ["claude,cursor"] : ["claude,cursor", "claude", "cursor", "none"];
const ENV = {
  ...process.env,
  VIRASTACK_TELEMETRY_DISABLED: "1",
  npm_config_user_agent: "pnpm/10.0.0 npm/? node/? linux x64",
  CI: "1",
};

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, env: ENV, encoding: "utf8" });
  return { ok: result.status === 0, output: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

function checkProject(dir, { template, agents }) {
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
  expect(agentsMd.includes("BEGIN:nextjs-agent-rules") === (template === "nextjs"), "Next.js block does not match the template");

  if (FULL) {
    expect(has(".agents/skills/emil-design-eng/SKILL.md"), "design skill missing");
    if (claude) {
      const skill = path.join(dir, ".claude/skills/emil-design-eng");
      expect(existsSync(skill) && !lstatSync(skill).isSymbolicLink(), ".claude/skills is missing or a symlink");
    }
    for (const script of ["typecheck", "lint:ci", "test"]) {
      const result = run("pnpm", ["run", script], dir);
      expect(result.ok, `pnpm run ${script} failed:\n${result.output.slice(-3000)}`);
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
        ? checkProject(path.join(work, name), { template, agents })
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
console.log(failures ? `\n${failures} failed` : "\nall passed");
process.exitCode = failures ? 1 : 0;
