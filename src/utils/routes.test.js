import { describe, expect, it } from "vitest";

import { isRouteFile, isSameRoute, isTanstackLayout, routesDirs, toRoutePath } from "./routes.js";

describe("toRoutePath in Next.js", () => {
  it.each([
    ["src/app/page.tsx", "/"],
    ["src/app/products/page.tsx", "/products"],
    ["src/app/products/[id]/page.tsx", "/products/:id"],
    ["src/app/(shop)/products/page.tsx", "/products"],
    ["src/app/(shop)/(catalog)/products/[slug]/page.jsx", "/products/:slug"],
    ["src/app/products/route.ts", "/products"],
    ["src/app/docs/[...slug]/page.mdx", "/docs/*"],
    ["src/app/docs/[[...slug]]/page.tsx", "/docs/*?"],
    ["src/app/products/[post-id]/page.tsx", "/products/:post-id"],
    ["src/app/[locale]/products/page.tsx", "/:locale/products"],
  ])("%s is %s", (file, route) => {
    expect(toRoutePath(file)).toBe(route);
  });

  it("leaves the locale folder out only in an i18n project", () => {
    expect(toRoutePath("src/app/[locale]/products/page.tsx", { i18n: true })).toBe("/products");
    expect(toRoutePath("src/app/[locale]/(shop)/products/[id]/page.tsx", { i18n: true })).toBe("/products/:id");
    expect(toRoutePath("src/app/products/[locale]/page.tsx", { i18n: true })).toBe("/products/:locale");
  });

  it.each([
    "src/app/layout.tsx",
    "src/app/products/loading.tsx",
    "src/app/products/ProductCard.tsx",
    "src/app/_components/page.tsx",
    "src/app/@modal/products/page.tsx",
    "src/app/(.)products/[id]/page.tsx",
    "src/features/products/page.tsx",
  ])("%s is not a route", (file) => {
    expect(toRoutePath(file)).toBeNull();
  });
});

describe("toRoutePath in the Next.js Pages Router", () => {
  it.each([
    ["src/pages/products.tsx", "/products"],
    ["src/pages/products/index.tsx", "/products"],
    ["src/pages/products/[id].tsx", "/products/:id"],
    ["pages/products/[id].jsx", "/products/:id"],
    ["pages/index.tsx", "/"],
    ["src/pages/api/products.ts", "/api/products"],
  ])("%s is %s", (file, route) => {
    expect(toRoutePath(file)).toBe(route);
  });

  it.each(["src/pages/_app.tsx", "src/pages/_document.tsx", "pages/styles.css"])("%s is not a route", (file) => {
    expect(toRoutePath(file)).toBeNull();
  });
});

describe("toRoutePath in TanStack Start", () => {
  it.each([
    ["src/routes/index.tsx", "/"],
    ["src/routes/products.tsx", "/products"],
    ["src/routes/products/index.tsx", "/products"],
    ["src/routes/products.index.tsx", "/products"],
    ["src/routes/products.lazy.tsx", "/products"],
    ["src/routes/products/$id.tsx", "/products/:id"],
    ["src/routes/products.$productId.tsx", "/products/:productId"],
    ["src/routes/products/{$id}.tsx", "/products/:id"],
    ["src/routes/products/$post-id.tsx", "/products/:post-id"],
    ["src/routes/products/item-{$id}.tsx", "/products/:id"],
    ["src/routes/_shop/products.tsx", "/products"],
    ["src/routes/_shop.products.index.tsx", "/products"],
    ["src/routes/(shop)/products/index.tsx", "/products"],
    ["src/routes/products_.$id.edit.tsx", "/products/:id/edit"],
    ["src/routes/files/$.tsx", "/files/*"],
    ["src/routes/products/route.tsx", "/products"],
    ["src/routes/products.route.tsx", "/products"],
    ["src/routes/products/{-$id}.tsx", "/products/:id?"],
    ["src/routes/{-$lang}/products.tsx", "/:lang?/products"],
    ["src/routes/robots[.]txt.ts", "/robots.txt"],
  ])("%s is %s", (file, route) => {
    expect(toRoutePath(file)).toBe(route);
  });

  it.each([
    "src/routes/__root.tsx",
    "src/routes/_shop.tsx",
    "src/routes/_shop/route.tsx",
    "src/routes/-components/ProductCard.tsx",
    "src/routes/products/-helpers.ts",
    "src/routes/products.css",
  ])("%s is not a route", (file) => {
    expect(toRoutePath(file)).toBeNull();
  });

  it("leaves the locale prefix out only in an i18n project", () => {
    expect(toRoutePath("src/routes/{-$lang}/products.tsx", { i18n: true })).toBe("/products");
    expect(toRoutePath("src/routes/{-$lang}/products/$id.tsx", { i18n: true })).toBe("/products/:id");
    expect(toRoutePath("src/routes/{-$lang}.products.index.tsx", { i18n: true })).toBe("/products");
  });

  it("reads Windows paths too", () => {
    expect(toRoutePath("src\\routes\\products\\$id.tsx")).toBe("/products/:id");
  });
});

describe("isTanstackLayout", () => {
  const files = [
    "src/routes/products.tsx",
    "src/routes/products/index.tsx",
    "src/routes/blog.tsx",
    "src/routes/blog.$slug.tsx",
    "src/routes/about.tsx",
    "src/routes/about.lazy.tsx",
    "src/routes/shop/route.tsx",
  ];
  const outlet = "export const Route = createFileRoute('/products')({ component: () => <Outlet /> })";
  const page = "export const Route = createFileRoute('/products')({ component: () => <h1>Mine</h1> })";

  it("calls a route that renders an Outlet for the routes under it a layout", () => {
    expect(isTanstackLayout("src/routes/products.tsx", files, outlet)).toBe(true);
    expect(isTanstackLayout("src/routes/blog.tsx", files, outlet)).toBe(true);
    expect(isTanstackLayout("src/routes/shop/route.tsx", files, outlet)).toBe(true);
  });

  it("calls a route without an Outlet a page, even with routes under it", () => {
    expect(isTanstackLayout("src/routes/products.tsx", files, page)).toBe(false);
    expect(isTanstackLayout("src/routes/shop/route.tsx", files, page)).toBe(false);
  });

  it("calls a lone leaf, and its lazy half, a page", () => {
    expect(isTanstackLayout("src/routes/about.tsx", files, outlet)).toBe(false);
    expect(isTanstackLayout("src/routes/products/index.tsx", files, outlet)).toBe(false);
    expect(isTanstackLayout("src/app/products/page.tsx", files, outlet)).toBe(false);
  });
});

describe("isSameRoute", () => {
  it("matches dynamic segments whatever their names, hyphens included", () => {
    expect(isSameRoute("/products/:post-id", "/products/:id")).toBe(true);
    expect(isSameRoute("/products/:id", "/products/:slug")).toBe(true);
    expect(isSameRoute("/products", "/products")).toBe(true);
    expect(isSameRoute("/products/:id", "/products/new")).toBe(false);
    expect(isSameRoute("/products", "/products/:id")).toBe(false);
    expect(isSameRoute("/docs/*", "/docs/:id")).toBe(false);
  });

  it("lets an optional segment answer with and without itself", () => {
    expect(isSameRoute("/products/:id?", "/products")).toBe(true);
    expect(isSameRoute("/products/:id?", "/products/:slug")).toBe(true);
    expect(isSameRoute("/:lang?/products", "/products")).toBe(true);
    expect(isSameRoute("/products/:id?", "/products/new/edit")).toBe(false);
  });

  it("lets an optional catch-all answer its parent, and a required one not", () => {
    expect(isSameRoute("/products", "/products/*?")).toBe(true);
    expect(isSameRoute("/products/*?", "/products")).toBe(true);
    expect(isSameRoute("/products", "/products/*")).toBe(false);
    expect(isSameRoute("/products/:id", "/products/*?")).toBe(false);
  });
});

describe("the routes folder", () => {
  it("is the template's", () => {
    expect(routesDirs("nextjs")).toEqual(["src/app", "src/pages", "pages"]);
    expect(routesDirs("tanstack")).toEqual(["src/routes"]);
    expect(isRouteFile("src/app/products/page.tsx")).toBe(true);
    expect(isRouteFile("src/routes/products.tsx")).toBe(true);
    expect(isRouteFile("src/features/products/components/ProductList.tsx")).toBe(false);
  });
});
