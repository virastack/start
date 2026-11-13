/**
 * Keeps `registry.json` in step with `registry/<name>` and the templates, then builds it with shadcn:
 * shared files in `common`, framework files in `nextjs` and `tanstack`. The i18n layers replace the
 * `common` files that hold text, and carry the messages `virastack add` merges. A module can bring
 * its own pages: the files a layer has under `src/app` or `src/routes` become `meta.pages`, which
 * `virastack add` checks against the project's routes, leaves out with `--no-pages` and lists when
 * it is done. A module without pages goes on a page the person writes.
 *
 *   node scripts/build-registry.js [outDir]    default: ../virastack.com/public/r, or registry-dist
 *
 * The output is what virastack.com serves at /r, and a deploy of the site publishes it: the CLI
 * reads the registry on every run. This script never ships in the npm package.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SHADCN } from "../src/utils/features.js";
import { toRoutePath } from "../src/utils/routes.js";
import { syncSitePreview } from "./sync-site-preview.js";

const SCHEMA = "https://ui.shadcn.com/schema/registry.json";
const AUTHOR = "ViraStack <https://virastack.com>";

/** Provided by every template, so an item never lists them. */
const BUILT_IN = new Set([
  "react",
  "react-dom",
  "next",
  "next-intl",
  "@tanstack/react-router",
  "@tanstack/react-start",
]);

export const FEATURES = [
  {
    name: "users",
    title: "Users",
    description: "A searchable user list with pagination in the URL, a shared add and edit form and row actions.",
    frameworks: ["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"],
    route: {
      feature: "users",
      component: "UsersDirectory",
      fallback: "UsersDirectorySkeleton",
      routeSearch: { name: "usersRouteSearch", file: "users-params.schema" },
    },
    minStartVersion: "2.0.0",
  },
  {
    name: "checkout-address",
    title: "Checkout address",
    description: "Choose, add and edit shipping and billing addresses, with Turkish address data.",
    frameworks: ["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"],
    route: { feature: "checkout-address", component: "CheckoutAddress" },
    /** Packages the module brings that a template may lack, such as ViraStack packages not chosen at `init`. */
    packages: { "@virastack/address": "^1.0.0", "@virastack/mask": "^2.1.0" },
    minStartVersion: "2.0.0",
  },
  {
    name: "checkout-card",
    title: "Checkout card",
    description: "Choose or add a credit card, with the card number and CVV kept off the network.",
    frameworks: ["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"],
    route: { feature: "checkout-card", component: "CheckoutCard" },
    packages: { "@virastack/mask": "^2.2.0" },
    minStartVersion: "2.0.0",
  },
  {
    name: "products",
    title: "Products",
    description: "A paginated product list with search, category, sorting and the page in the URL, and a page for each product.",
    frameworks: ["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"],
    // Its pages are in its layers, so `route` only describes the entry for a page of the reader's,
    // after `add --no-pages`.
    route: { feature: "products", component: "ProductList", fallback: "ProductListSkeleton" },
    packages: { "embla-carousel-react": "^8.6.0" },
    /** shadcn components no template ships: shadcn adds them only where they are missing. */
    ui: ["card"],
    /**
     * What `e2e --full` asks the built app for: pages with text the server must render (DummyJSON's
     * own data), and URLs that must answer 404.
     */
    e2e: {
      pages: [
        { path: "/products", text: "Essence Mascara Lash Princess" },
        { path: "/products?category=smartphones&sort=price-asc", text: "Realme C35", before: "iPhone 13 Pro" },
        { path: "/products?category=smartphones&sort=price-desc", text: "iPhone 13 Pro", before: "Realme C35" },
        { path: "/products?page=2", text: "Green Bell Pepper", absent: "Essence Mascara Lash Princess" },
        // The same in every template: a whole number however it is written, or the first page.
        { path: "/products?page=2e0", text: "Green Bell Pepper", absent: "Essence Mascara Lash Princess" },
        { path: "/products?page=abc", text: "Essence Mascara Lash Princess" },
        { path: "/products/1", text: "Essence Mascara Lash Princess" },
      ],
      missing: ["/products/999999", "/products/abc", "/products/01"],
      /** What the 404 of a missing product has to show: the module's own state and its link. */
      notFound: { text: "Product not found", link: "/products" },
      /** Pages whose current prices, in order, rise (`asc`) or fall (`desc`). */
      sorted: [
        { path: "/products?sort=price-asc", order: "asc" },
        { path: "/products?sort=price-desc", order: "desc" },
      ],
      /** Raw HTML the pages' heads must have: meta filled from the data, and structured data. */
      head: [
        {
          path: "/products/1",
          includes: ['property="og:title" content="Essence Mascara Lash Princess"', 'type="application/ld+json"'],
        },
        { path: "/products?category=smartphones", includes: ["<title>Smartphones"] },
        { path: "/products?q=phone", includes: ['name="robots" content="noindex, follow"'] },
      ],
      /** On the i18n templates' `/tr` pages: UI text, a product link, the 404 text, a title. */
      tr: {
        text: "Ürünler",
        link: "/tr/products/",
        notFound: "Ürün bulunamadı",
        head: { path: "/tr/products?category=smartphones&page=2", includes: ["<title>Smartphones · Sayfa 2"] },
      },
    },
    minStartVersion: "2.0.0",
  },
  {
    name: "cart",
    title: "Cart",
    description: "A cart page with item selection, quantities, removal, a coupon code and an order summary.",
    frameworks: ["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"],
    // Its page is in its layers, so `route` only describes the entry for a page of the reader's,
    // after `add --no-pages`.
    route: { feature: "cart", component: "Cart" },
    /** shadcn components no template ships: shadcn adds them only where they are missing. */
    ui: ["drawer"],
    e2e: {
      // The server renders the page and the cart loads in the browser, so the HTML has only the
      // page's own title, in the visitor's language.
      pages: [{ path: "/cart", text: "Cart", localized: true }],
      missing: [],
      head: [{ path: "/cart", includes: ['name="robots" content="noindex, follow"'] }],
      tr: { text: "Sepet" },
    },
    minStartVersion: "2.0.0",
  },
];

function listFiles(root, rel) {
  const full = path.join(root, rel);
  if (!existsSync(full)) throw new Error(`Missing path: ${full}`);
  const entries = readdirSync(full, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const child = path.posix.join(rel, entry.name);
    return entry.isDirectory() ? listFiles(root, child) : [child];
  });
}

/** `@scope/name/sub` becomes `@scope/name`, `zustand/middleware` becomes `zustand`. */
export function packageName(specifier) {
  if (specifier.startsWith("@/") || specifier.startsWith(".")) return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

export function findDependencies(contents, pkg, packages = {}) {
  const dependencies = new Set();
  const devDependencies = new Set();
  for (const content of contents) {
    for (const [, specifier] of content.matchAll(/from "([^"]+)"/g)) {
      const name = packageName(specifier);
      if (!name || BUILT_IN.has(name)) continue;
      const dev = pkg.devDependencies?.[name];
      const prod = packages[name] ?? pkg.dependencies?.[name];
      if (prod) dependencies.add(`${name}@${prod}`);
      else if (dev) devDependencies.add(`${name}@${dev}`);
      else throw new Error(`"${name}" is imported but missing from the template's package.json`);
    }
  }
  return { dependencies: [...dependencies].sort(), devDependencies: [...devDependencies].sort() };
}

function readMessages(root, source) {
  const dir = path.join(root, source, "messages");
  if (!existsSync(dir)) return null;
  return Object.fromEntries(
    readdirSync(dir).map((file) => [
      path.basename(file, ".json"),
      JSON.parse(readFileSync(path.join(dir, file), "utf8")),
    ]),
  );
}

export function buildItem(root, feature, framework) {
  const i18n = framework.endsWith("-i18n");
  const base = framework.replace("-i18n", "");
  const template = path.join(root, i18n ? "templates-i18n" : "templates", base);
  const source = path.posix.join("registry", feature.name);
  const pkg = JSON.parse(readFileSync(path.join(template, "package.json"), "utf8"));

  // A later layer replaces the same file of an earlier one.
  const byTarget = new Map();
  for (const layer of ["common", framework]) {
    // A module with no framework-specific code has no layer for it.
    if (!existsSync(path.join(root, source, layer))) continue;
    for (const target of listFiles(path.join(root, source, layer), "src")) {
      byTarget.set(target, path.posix.join(source, layer, target));
    }
  }
  const files = [...byTarget]
    .map(([target, file]) => ({ path: file, type: "registry:file", target }))
    .sort((a, b) => a.target.localeCompare(b.target));
  const messages = readMessages(root, path.posix.join(source, framework));
  const pages = files
    .flatMap(({ target }) => {
      const route = toRoutePath(target, { i18n });
      return route ? [{ path: route, file: target }] : [];
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    name: `${feature.name}-${framework}`,
    type: "registry:item",
    title: feature.title,
    description: feature.description,
    author: AUTHOR,
    ...findDependencies(
      files.map((file) => readFileSync(path.join(root, file.path), "utf8")),
      pkg,
      feature.packages,
    ),
    ...(feature.ui && { registryDependencies: feature.ui }),
    files,
    meta: {
      product: "virastack-start",
      framework: base,
      minStartVersion: feature.minStartVersion,
      entry: {
        name: feature.route.component,
        file: `@/features/${feature.name}/components/${feature.route.component}`,
      },
      ...(pages.length > 0 && { pages }),
      ...(messages && { messages }),
    },
  };
}

export function buildRegistry(root) {
  return {
    $schema: SCHEMA,
    name: "virastack",
    homepage: "https://virastack.com",
    items: FEATURES.flatMap((feature) =>
      feature.frameworks.map((framework) => buildItem(root, feature, framework)),
    ),
  };
}

function shadcn(root, args) {
  const result = spawnSync("npx", ["--yes", SHADCN, ...args], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const site = path.resolve(root, "../virastack.com/public/r");
  const outDir = path.resolve(root, process.argv[2] ?? (existsSync(site) ? site : "registry-dist"));
  const registry = buildRegistry(root);

  // Written only when it changed, so a build into another folder leaves the repository as it is.
  const registryPath = path.join(root, "registry.json");
  const content = `${JSON.stringify(registry, null, 2)}\n`;
  if (!existsSync(registryPath) || readFileSync(registryPath, "utf8") !== content) {
    writeFileSync(registryPath, content);
  }
  shadcn(root, ["registry", "validate"]);
  shadcn(root, ["build", "registry.json", "--output", outDir]);
  // Without a target folder this is a release build, so the site's preview follows it.
  if (!process.argv[2]) await syncSitePreview(root);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
