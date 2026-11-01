import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { adaptWorkflow, getHookCommands } from "./setup-package-manager.js";

const template = readFileSync(
  path.resolve(import.meta.dirname, "../../templates/nextjs/.github/workflows/ci.yml"),
  "utf8",
);

describe("adaptWorkflow", () => {
  it("leaves the pnpm workflow as it is", () => {
    expect(adaptWorkflow(template, "pnpm")).toBe(template);
  });

  it.each(["npm", "yarn", "bun"])("leaves no pnpm behind for %s", (pm) => {
    expect(adaptWorkflow(template, pm)).not.toMatch(/pnpm/);
  });

  it("uses npm's own cache, install and run", () => {
    const text = adaptWorkflow(template, "npm");
    expect(text).toContain('cache: "npm"');
    expect(text).toContain("run: npm ci --legacy-peer-deps");
    expect(text).toContain("run: npm run build");
  });

  it("enables Corepack for modern Yarn only", () => {
    const modern = adaptWorkflow(template, "yarn");
    const classic = adaptWorkflow(template, "yarn", { isYarnClassic: true });
    expect(modern).toContain("corepack enable");
    expect(modern).toContain("yarn install --immutable");
    expect(classic).not.toContain("corepack");
    expect(classic).toContain("yarn install --frozen-lockfile");
  });

  it("installs Bun and drops the Node cache", () => {
    const text = adaptWorkflow(template, "bun");
    expect(text).toContain("oven-sh/setup-bun@v2");
    expect(text).not.toContain("cache:");
    expect(text).toContain("run: bun run test");
  });

  it("keeps every other step", () => {
    for (const pm of ["npm", "yarn", "bun"]) {
      const text = adaptWorkflow(template, pm);
      for (const step of ["Checkout", "Setup Node.js", "Typecheck", "Lint", "Knip", "Test", "Build"]) {
        expect(text).toContain(`name: ${step}`);
      }
    }
  });
});

describe("getHookCommands", () => {
  it.each([
    ["pnpm", "pnpm exec lint-staged\n"],
    ["npm", "npx --no -- lint-staged\n"],
    ["yarn", "yarn lint-staged\n"],
    ["bun", "bunx lint-staged\n"],
  ])("runs lint-staged with %s", (pm, command) => {
    expect(getHookCommands(pm)["pre-commit"]).toBe(command);
    expect(getHookCommands(pm)["pre-push"]).toBe(`${pm} run typecheck && ${pm} run lint:ci\n`);
  });
});
