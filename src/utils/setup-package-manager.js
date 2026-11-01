import { promises as fs } from "node:fs";
import path from "node:path";

const WORKFLOW = ".github/workflows/ci.yml";

/** The template is written for pnpm; `yarn@1` has no `--immutable` and needs no Corepack. */
function getCiCommands(pm, isYarnClassic) {
  switch (pm) {
    case "npm":
      return { setup: "", cache: 'cache: "npm"', install: "npm ci --legacy-peer-deps", run: "npm run" };
    case "yarn":
      return isYarnClassic
        ? { setup: "", cache: 'cache: "yarn"', install: "yarn install --frozen-lockfile", run: "yarn run" }
        : {
            setup: "      - name: Enable Corepack\n        run: corepack enable\n\n",
            cache: 'cache: "yarn"',
            install: "yarn install --immutable",
            run: "yarn run",
          };
    case "bun":
      return {
        setup: "      - name: Install Bun\n        uses: oven-sh/setup-bun@v2\n\n",
        cache: "",
        install: "bun install --frozen-lockfile",
        run: "bun run",
      };
    default:
      return null;
  }
}

export function adaptWorkflow(text, pm, { isYarnClassic = false } = {}) {
  const commands = getCiCommands(pm, isYarnClassic);
  if (!commands) return text;

  return text
    .replace(/ {6}- name: Install pnpm\n[\s\S]*?\n\n/, commands.setup)
    .replace(/\n {10}cache: "pnpm"/, commands.cache ? `\n          ${commands.cache}` : "")
    .replace("pnpm install --frozen-lockfile", commands.install)
    .replaceAll("pnpm run", commands.run);
}

export function getHookCommands(pm) {
  const exec = { pnpm: "pnpm exec", yarn: "yarn", bun: "bunx" }[pm] ?? "npx --no --";
  return {
    "pre-commit": `${exec} lint-staged\n`,
    "pre-push": `${pm} run typecheck && ${pm} run lint:ci\n`,
  };
}

/** Points CI and git hooks at the package manager the project was created with. */
export async function setupPackageManager(targetDir, pm, options) {
  const workflowPath = path.join(targetDir, WORKFLOW);
  const workflow = await fs.readFile(workflowPath, "utf8");
  await fs.writeFile(workflowPath, adaptWorkflow(workflow, pm, options));

  for (const [hook, content] of Object.entries(getHookCommands(pm))) {
    await fs.writeFile(path.join(targetDir, ".husky", hook), content);
  }
}
