import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const CLI = fileURLToPath(new URL("../../bin/virastack.js", import.meta.url));
const dirs = [];

function folder(files = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "virastack-remove-"));
  dirs.push(dir);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), content);
  }
  return dir;
}

/** Runs `virastack remove` the way a script does: no terminal to ask in. */
function remove(cwd, registry, args = []) {
  const env = { ...process.env, VIRASTACK_REGISTRY_URL: registry, VIRASTACK_TELEMETRY_DISABLED: "1", NO_COLOR: "1", FORCE_COLOR: "" };
  const result = spawnSync(process.execPath, [CLI, "remove", ...args], { cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("virastack remove", () => {
  const item = {
    name: "products-nextjs",
    files: [
      { target: "src/features/products/a.ts", content: "a" },
      { target: "src/app/products/page.tsx", content: "list" },
    ],
  };
  const pkg = JSON.stringify({ virastack: { template: "nextjs" } });

  it("keeps a changed page without a terminal, and says why before it deletes the rest", () => {
    const registry = folder({ "products-nextjs.json": JSON.stringify(item) });
    const cwd = folder({ "package.json": pkg, "src/features/products/a.ts": "a", "src/app/products/page.tsx": "edited" });

    const { status, output } = remove(cwd, registry, ["products", "--yes"]);

    expect(status).toBe(0);
    expect(output).toContain("These pages differ from the module's, so they stay");
    expect(output).toContain("may be your own (after --no-pages) or module pages you edited");
    expect(output).toContain("If they still import the module");
    expect(output.indexOf("src/app/products/page.tsx")).toBeLessThan(output.indexOf("products removed."));
    expect(readFileSync(path.join(cwd, "src/app/products/page.tsx"), "utf8")).toBe("edited");
    expect(existsSync(path.join(cwd, "src/features/products"))).toBe(false);
  });

  it("lists only the modules of the project's template", () => {
    const items = ["users-nextjs", "users-tanstack", "products-nextjs"].map((name) => ({ name }));
    const registry = folder({ "registry.json": JSON.stringify({ items }) });
    const cwd = folder({ "package.json": JSON.stringify({ virastack: { template: "tanstack" } }) });

    const { status, output } = remove(cwd, registry, ["ghost"]);

    expect(status).toBe(1);
    expect(output).toContain("Modules: users\n");
  });
});
