import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildItem, FEATURES, findDependencies, packageName } from "./build-registry.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const users = FEATURES.find((feature) => feature.name === "users");

describe("packageName", () => {
  it.each([
    ["zustand/middleware", "zustand"],
    ["@tanstack/react-query", "@tanstack/react-query"],
    ["@hookform/resolvers/zod", "@hookform/resolvers"],
    ["@/lib/api", null],
    ["./local", null],
  ])("reads %s as %s", (specifier, expected) => {
    expect(packageName(specifier)).toBe(expected);
  });
});

describe("findDependencies", () => {
  it("takes versions from the template and skips built-in packages", () => {
    const pkg = { dependencies: { zod: "^4.0.0", react: "^19" }, devDependencies: { vitest: "^5" } };
    const contents = ['import { z } from "zod"\nimport { useState } from "react"\nimport { it } from "vitest"'];
    expect(findDependencies(contents, pkg)).toEqual({
      dependencies: ["zod@^4.0.0"],
      devDependencies: ["vitest@^5"],
    });
  });

  it("fails when a package is missing from the template", () => {
    expect(() => findDependencies(['import x from "ghost"'], {})).toThrow('"ghost"');
  });
});

describe.each(["nextjs", "tanstack"])("users for %s", (framework) => {
  const item = buildItem(REPO, users, framework);

  it("installs into the same paths as the template", () => {
    for (const file of item.files) expect(file.target).toBe(file.path);
    expect(item.files.some((file) => file.target.startsWith("src/features/users/"))).toBe(true);
  });

  it("brings its route", () => {
    const route = framework === "nextjs" ? "src/app/users/page.tsx" : "src/routes/users.tsx";
    expect(item.files.map((file) => file.target)).toContain(route);
  });

  it("uses the framework's own URL state", () => {
    const names = item.dependencies.join(" ");
    if (framework === "nextjs") expect(names).toContain("nuqs@");
    else expect(names).not.toContain("nuqs");
  });
});
