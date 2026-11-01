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

describe.each(["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"])("users for %s", (framework) => {
  const item = buildItem(REPO, users, framework);

  it("installs into the same paths as the template", () => {
    for (const file of item.files) expect(file.path.endsWith(`/${file.target}`)).toBe(true);
    expect(item.files.some((file) => file.target.startsWith("src/features/users/"))).toBe(true);
  });

  it("brings its route", () => {
    const route = {
      nextjs: "src/app/users/page.tsx",
      tanstack: "src/routes/users.tsx",
      "nextjs-i18n": "src/app/[locale]/users/page.tsx",
      "tanstack-i18n": "src/routes/{-$lang}/users.tsx",
    }[framework];
    expect(item.files.map((file) => file.target)).toContain(route);
  });

  it("names its maker", () => {
    expect(item.author).toContain("ViraStack");
    expect(item.meta).toMatchObject({ product: "virastack-start", framework: framework.replace("-i18n", "") });
  });

  it("carries messages only with i18n, with the same keys in every locale", () => {
    const { messages } = item.meta;
    if (!messages) {
      expect(framework.endsWith("-i18n")).toBe(false);
      return;
    }
    const keys = (locale) => JSON.stringify(Object.keys(locale.Users ?? locale).sort());
    expect(keys(messages.tr)).toBe(keys(messages.en));
    expect(Object.keys(messages.en).length).toBeGreaterThan(0);
  });

  it("uses the framework's own URL state", () => {
    const names = item.dependencies.join(" ");
    if (framework.startsWith("nextjs")) expect(names).toContain("nuqs@");
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
