import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TOOLS } from "../src/utils/tools.js";
import { buildItem, buildRegistry, FEATURES, findDependencies, packageName } from "./build-registry.js";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const users = FEATURES.find((feature) => feature.name === "users");
const products = FEATURES.find((feature) => feature.name === "products");
if (!products) throw new Error("FEATURES has no products module");

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

  it("brings only the feature, never a route", () => {
    expect(item.files.filter((file) => !file.target.startsWith("src/features/users/"))).toEqual([]);
  });

  it("names the component to import", () => {
    expect(item.meta.entry).toEqual({
      name: "UsersDirectory",
      file: "@/features/users/components/UsersDirectory",
    });
    expect(item.files.map((file) => file.target)).toContain(`src/features/users/components/UsersDirectory.tsx`);
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

describe("pages", () => {
  it.each([
    ["nextjs", "src/app/products/page.tsx", "src/app/products/[id]/page.tsx"],
    ["nextjs-i18n", "src/app/[locale]/products/page.tsx", "src/app/[locale]/products/[id]/page.tsx"],
    ["tanstack", "src/routes/products/index.tsx", "src/routes/products/$id.tsx"],
    ["tanstack-i18n", "src/routes/{-$lang}/products/index.tsx", "src/routes/{-$lang}/products/$id.tsx"],
  ])("are listed with the same URLs in %s", (framework, list, detail) => {
    const item = buildItem(REPO, products, framework);
    expect(item.meta.pages).toEqual([
      { path: "/products", file: list },
      { path: "/products/:id", file: detail },
    ]);
    for (const page of item.meta.pages) expect(item.files.map((file) => file.target)).toContain(page.file);
  });

  it("ship the module's not-found page beside the detail page in Next.js, without listing it as a page", () => {
    for (const framework of ["nextjs", "nextjs-i18n"]) {
      const item = buildItem(REPO, products, framework);
      const notFound = item.files.find((file) => file.target.endsWith("[id]/not-found.tsx"));
      expect(notFound).toBeDefined();
      expect(item.meta.pages.map((page) => page.file)).not.toContain(notFound?.target);
    }
  });

  it("ship in every template with tests and, with i18n, messages for every locale", () => {
    expect(products.frameworks).toEqual(["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"]);
    for (const framework of products.frameworks) {
      const item = buildItem(REPO, products, framework);
      expect(item.files.filter((file) => file.target.endsWith(".test.tsx")).length).toBeGreaterThanOrEqual(2);
      if (framework.endsWith("-i18n")) expect(Object.keys(item.meta.messages).sort()).toEqual(["en", "tr"]);
    }
  });

  it("sit where the module's links point", () => {
    const constants = readFileSync(
      path.join(REPO, "registry/products/common/src/features/products/constants/products.constants.ts"),
      "utf8",
    );
    const [, route] = /export const PRODUCTS_ROUTE = "([^"]+)"/.exec(constants) ?? [];
    expect(buildItem(REPO, products, "nextjs").meta.pages.map((page) => page.path)).toContain(route);
  });

  it("list the cart page at the same URL in every template", () => {
    const cart = FEATURES.find(({ name }) => name === "cart");
    expect(cart).toBeDefined();
    for (const framework of cart?.frameworks ?? []) {
      expect(buildItem(REPO, cart, framework).meta.pages.map((page) => page.path)).toEqual(["/cart"]);
    }
  });

  it("are not listed for a module without them", () => {
    for (const feature of FEATURES.filter(({ name }) => !["products", "cart"].includes(name))) {
      for (const framework of feature.frameworks) expect(buildItem(REPO, feature, framework).meta.pages).toBeUndefined();
    }
  });
});

describe("module names", () => {
  it("never hide a tool", () => {
    const tools = TOOLS.map((tool) => tool.id);
    expect(FEATURES.map((feature) => feature.name).filter((name) => tools.includes(name))).toEqual([]);
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
