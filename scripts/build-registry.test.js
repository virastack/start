import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { buildItem, buildRegistry, FEATURES, findDependencies, packageName } from "./build-registry.js";

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
    for (const file of item.files) expect(file.path.endsWith(`/${file.target}`)).toBe(true);
    expect(item.files.some((file) => file.target.startsWith("src/features/users/"))).toBe(true);
  });

  it("brings its route", () => {
    const route = framework === "nextjs" ? "src/app/users/page.tsx" : "src/routes/users.tsx";
    expect(item.files.map((file) => file.target)).toContain(route);
  });

  it("names its maker", () => {
    expect(item.author).toContain("ViraStack");
    expect(item.meta).toEqual({ product: "virastack-start", framework });
  });

  it("uses the framework's own URL state", () => {
    const names = item.dependencies.join(" ");
    if (framework === "nextjs") expect(names).toContain("nuqs@");
    else expect(names).not.toContain("nuqs");
  });
});

describe("registry.json", () => {
  it("matches the sources; run npm run build:registry", () => {
    const saved = JSON.parse(readFileSync(path.join(REPO, "registry.json"), "utf8"));
    expect(saved).toEqual(buildRegistry(REPO));
  });

  it("is a flat registry with unique names", () => {
    const names = buildRegistry(REPO).items.map((item) => item.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
