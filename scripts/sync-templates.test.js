import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { applyPlan, GROUPS, planDependencies, planFiles, TEMPLATES } from "./sync-templates.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = "templates/a";
const TARGET = "templates/b";
const roots = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture(files) {
  const root = mkdtempSync(path.join(os.tmpdir(), "virastack-sync-"));
  roots.push(root);
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  }
  return root;
}

const read = (root, file) => readFileSync(path.join(root, file), "utf8");
const group = (entries) => [{ name: "test", source: SOURCE, targets: [TARGET], entries }];

describe("planFiles", () => {
  it("reports nothing when files match", () => {
    const root = fixture({ "templates/a/x.ts": "1", "templates/b/x.ts": "1" });
    expect(planFiles(root, group(["x.ts"]))).toEqual({ copies: [], removals: [] });
  });

  it("reports a changed and a missing file", () => {
    const root = fixture({
      "templates/a/x.ts": "new",
      "templates/a/y.ts": "new",
      "templates/b/x.ts": "old",
    });
    const { copies } = planFiles(root, group(["x.ts", "y.ts"]));
    expect(copies.map(({ to }) => to)).toEqual(["templates/b/x.ts", "templates/b/y.ts"]);
  });

  it("reports an extra file only inside a synced folder", () => {
    const root = fixture({
      "templates/a/ui/a.tsx": "1",
      "templates/b/ui/a.tsx": "1",
      "templates/b/ui/extra.tsx": "1",
      "templates/b/other.tsx": "1",
    });
    const { removals } = planFiles(root, group(["ui/"]));
    expect(removals).toEqual(["templates/b/ui/extra.tsx"]);
  });

  it("walks nested folders and skips build output", () => {
    const root = fixture({
      "templates/a/ui/deep/a.tsx": "1",
      "templates/a/ui/node_modules/skip.js": "1",
      "templates/b/ui/.next/keep.js": "1",
    });
    const { copies, removals } = planFiles(root, group(["ui/"]));
    expect(copies.map(({ to }) => to)).toEqual(["templates/b/ui/deep/a.tsx"]);
    expect(removals).toEqual([]);
  });

  it("compares bytes, so binary files count", () => {
    const root = fixture({
      "templates/a/logo.png": Buffer.from([0, 255, 1]),
      "templates/b/logo.png": Buffer.from([0, 255, 2]),
    });
    expect(planFiles(root, group(["logo.png"])).copies).toHaveLength(1);
  });

  it("fails when a listed source file is missing", () => {
    const root = fixture({ "templates/b/x.ts": "1" });
    expect(() => planFiles(root, group(["x.ts"]))).toThrow("Source file is missing");
  });

  it("refuses features and paths that leave the template", () => {
    const root = fixture({ "templates/a/x.ts": "1" });
    expect(() => planFiles(root, group(["src/features/users/"]))).toThrow("out of scope");
    expect(() => planFiles(root, group(["../../secret"]))).toThrow("leaves the template");
    expect(() => planFiles(root, group(["/etc/passwd"]))).toThrow("leaves the template");
  });

  it("writes nothing while planning", () => {
    const root = fixture({ "templates/a/x.ts": "new", "templates/b/x.ts": "old" });
    planFiles(root, group(["x.ts"]));
    expect(read(root, "templates/b/x.ts")).toBe("old");
  });
});

describe("applyPlan", () => {
  it("makes the target match, and a second plan is empty", () => {
    const root = fixture({
      "templates/a/ui/a.tsx": "new",
      "templates/a/ui/deep/b.tsx": "new",
      "templates/b/ui/a.tsx": "old",
      "templates/b/ui/extra.tsx": "old",
    });
    const groups = group(["ui/"]);
    applyPlan(root, planFiles(root, groups), []);
    expect(read(root, "templates/b/ui/a.tsx")).toBe("new");
    expect(read(root, "templates/b/ui/deep/b.tsx")).toBe("new");
    expect(existsSync(path.join(root, "templates/b/ui/extra.tsx"))).toBe(false);
    expect(planFiles(root, groups)).toEqual({ copies: [], removals: [] });
  });

  it("leaves files outside the entries alone", () => {
    const root = fixture({
      "templates/a/x.ts": "new",
      "templates/b/x.ts": "old",
      "templates/a/src/features/users/a.ts": "source",
      "templates/b/src/features/users/a.ts": "target",
    });
    applyPlan(root, planFiles(root, group(["x.ts"])), []);
    expect(read(root, "templates/b/src/features/users/a.ts")).toBe("target");
  });
});

describe("planDependencies", () => {
  const pkg = (value) => JSON.stringify(value);

  it("reports a version that differs from the first template", () => {
    const root = fixture({
      "templates/a/package.json": pkg({ dependencies: { zod: "^4.0.0" } }),
      "templates/b/package.json": pkg({ devDependencies: { zod: "^3.0.0" } }),
    });
    expect(planDependencies(root, [SOURCE, TARGET])).toEqual([
      {
        template: TARGET,
        field: "devDependencies",
        name: "zod",
        version: "^3.0.0",
        expected: "^4.0.0",
      },
    ]);
  });

  it("ignores a package only one template has", () => {
    const root = fixture({
      "templates/a/package.json": pkg({ dependencies: { next: "16.0.0" } }),
      "templates/b/package.json": pkg({ dependencies: { vite: "8.0.0" } }),
    });
    expect(planDependencies(root, [SOURCE, TARGET])).toEqual([]);
  });

  it("fixes only the version when applied", () => {
    const root = fixture({
      "templates/a/package.json": pkg({ dependencies: { zod: "^4.0.0" } }),
      "templates/b/package.json": pkg({ name: "b", dependencies: { zod: "^3.0.0", vite: "8.0.0" } }),
    });
    applyPlan(root, { copies: [], removals: [] }, planDependencies(root, [SOURCE, TARGET]));
    expect(JSON.parse(read(root, "templates/b/package.json"))).toEqual({
      name: "b",
      dependencies: { zod: "^4.0.0", vite: "8.0.0" },
    });
  });
});

describe("this repository", () => {
  it("keeps the four templates in sync", () => {
    expect(planFiles(REPO)).toEqual({ copies: [], removals: [] });
    expect(planDependencies(REPO)).toEqual([]);
  });

  it("uses each template as a target or a source", () => {
    const used = new Set(GROUPS.flatMap(({ source, targets }) => [source, ...targets]));
    expect([...used].sort()).toEqual([...TEMPLATES].sort());
  });

  it("never syncs features", () => {
    const entries = GROUPS.flatMap((item) => item.entries);
    expect(entries.filter((entry) => entry.includes("features"))).toEqual([]);
  });
});
