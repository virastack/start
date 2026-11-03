/**
 * End-to-end check of `virastack init` with ViraStack AI.
 *
 *   node scripts/e2e.js            16 runs: 2 templates x i18n on/off x 4 agent choices,
 *                                  with --skip-install (files, git, agent folders and skills)
 *   node scripts/e2e.js --full     4 runs with install, skills, typecheck, lint:ci and test,
 *                                  then `add users`, the same checks with and without the page
 *                                  the site tells people to write, a build and `remove users`
 *   --only <text>                  only runs whose name contains <text> (e.g. tanstack-i18n)
 *
 * Set VIRASTACK_AI_SPEC to test an unpublished ViraStack AI (e.g. file:/path/to.tgz
 * from `npm pack`); otherwise the published channel is used.
 */
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { FEATURES } from "./build-registry.js";
import { buildFeatureRoute } from "./feature-route.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "bin", "virastack.js");
const FULL = process.argv.includes("--full");
const onlyIndex = process.argv.indexOf("--only");
const ONLY = onlyIndex === -1 ? "" : process.argv[onlyIndex + 1];

const TEMPLATES = ["nextjs", "tanstack"];
const SKILLS = ["emil-design-eng", "better-ui", "better-accessibility"];
const AGENT_CHOICES = FULL ? ["claude,cursor"] : ["claude,cursor", "claude", "cursor", "none"];
const REGISTRY = path.join(os.tmpdir(), "virastack-e2e-registry");
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

function checkProject(dir, { agents, template, i18n }) {
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

    for (const { name, route } of FEATURES) {
      const added = run(process.execPath, [CLI, "add", name], dir);
      expect(added.ok, `add ${name} failed:\n${added.output.slice(-2000)}`);
      expect(has(`src/features/${name}`), `add ${name} wrote no files`);
      const pages = run("git", ["status", "--porcelain", "src/app", "src/routes"], dir).output.trim();
      expect(pages === "", `add ${name} touched the routes:\n${pages}`);
      checkScripts();

      // Not the module's default path: what the site shows has to work on any page.
      const { file, code } = buildFeatureRoute(route, { framework: template, i18n, path: "/team/members" });
      mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      writeFileSync(path.join(dir, file), code);
      const refreshRoutes = () => template === "tanstack" && run("pnpm", ["run", "generate-routes"], dir);
      refreshRoutes();
      checkScripts();
      const built = run("pnpm", ["run", "build"], dir);
      expect(built.ok, `pnpm run build with the ${name} page failed:\n${built.output.slice(-3000)}`);

      rmSync(path.join(dir, file));
      rmSync(path.join(dir, "src", template === "nextjs" ? "app" : "routes", ...(i18n ? [template === "nextjs" ? "[locale]" : "{-$lang}"] : []), "team"), { recursive: true, force: true });
      refreshRoutes();

      const removed = run(process.execPath, [CLI, "remove", name], dir);
      expect(removed.ok, `remove ${name} failed:\n${removed.output.slice(-2000)}`);
      // Packages stay after `remove`, because other code may use them.
      run("git", ["checkout", "--", "package.json", "pnpm-lock.yaml"], dir);
      run("pnpm", ["install", "--frozen-lockfile"], dir);
      const left = run("git", ["status", "--porcelain"], dir).output.trim();
      expect(left === "", `remove ${name} left changes:\n${left}`);
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
        ? checkProject(path.join(work, name), { agents, template, i18n })
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
