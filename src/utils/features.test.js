import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FEATURES, findFeature, setDemoPath, withoutExistingFiles } from "./features.js";
import { TOOLS } from "./tools.js";

const REPO = path.resolve(import.meta.dirname, "../..");
const dirs = [];

function project(files = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), "virastack-features-"));
  dirs.push(dir);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
    writeFileSync(path.join(dir, file), content);
  }
  return dir;
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("names", () => {
  it("shares one namespace with tools", () => {
    const names = [...TOOLS.map((tool) => tool.id), ...FEATURES.map((feature) => feature.id)];
    expect(new Set(names).size).toBe(names.length);
  });

  it("finds users", () => {
    expect(findFeature("users")).toMatchObject({ demoPath: "/users" });
    expect(findFeature("mask")).toBeUndefined();
  });
});

describe("withoutExistingFiles", () => {
  it("keeps the project's own file and reports it", async () => {
    const cwd = project({ "src/app/users/page.tsx": "mine" });
    const item = {
      name: "users-nextjs",
      files: [{ target: "src/app/users/page.tsx" }, { target: "src/features/users/a.ts" }],
    };

    const result = await withoutExistingFiles(item, cwd);

    expect(result.skipped).toEqual(["src/app/users/page.tsx"]);
    expect(result.item.files).toEqual([{ target: "src/features/users/a.ts" }]);
  });
});

describe.each(["nextjs", "tanstack"])("DEMO_PATH in the %s template", (template) => {
  const file = "src/features/home/constants/home.constants.ts";
  const source = readFileSync(path.join(REPO, "templates", template, file), "utf8");

  it("can be hidden and shown again", async () => {
    const cwd = project({ [file]: source });

    await setDemoPath(cwd, null);
    expect(readFileSync(path.join(cwd, file), "utf8")).toContain("DEMO_PATH = null as string | null");

    await setDemoPath(cwd, "/users");
    expect(readFileSync(path.join(cwd, file), "utf8")).toBe(source);
  });
});
