/**
 * Keeps `registry.json` in step with `registry/<name>` and the templates, then builds it with shadcn:
 * shared files in `common`, framework files and routes in `nextjs` and `tanstack`. The i18n layers
 * replace the `common` files that hold text, and carry the messages `virastack add` merges.
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
    description: "A searchable user list with pagination in the URL, a validated form and favorites.",
    frameworks: ["nextjs", "tanstack", "nextjs-i18n", "tanstack-i18n"],
    pagePath: "/users",
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

export function findDependencies(contents, pkg) {
  const dependencies = new Set();
  const devDependencies = new Set();
  for (const content of contents) {
    for (const [, specifier] of content.matchAll(/from "([^"]+)"/g)) {
      const name = packageName(specifier);
      if (!name || BUILT_IN.has(name)) continue;
      const dev = pkg.devDependencies?.[name];
      const prod = pkg.dependencies?.[name];
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
    for (const target of listFiles(path.join(root, source, layer), "src")) {
      byTarget.set(target, path.posix.join(source, layer, target));
    }
  }
  const files = [...byTarget]
    .map(([target, file]) => ({ path: file, type: "registry:file", target }))
    .sort((a, b) => a.target.localeCompare(b.target));
  const messages = readMessages(root, path.posix.join(source, framework));

  return {
    name: `${feature.name}-${framework}`,
    type: "registry:item",
    title: feature.title,
    description: feature.description,
    author: AUTHOR,
    ...findDependencies(
      files.map((file) => readFileSync(path.join(root, file.path), "utf8")),
      pkg,
    ),
    files,
    meta: {
      product: "virastack-start",
      framework: base,
      minStartVersion: feature.minStartVersion,
      ...(feature.pagePath && { pagePath: feature.pagePath }),
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

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const site = path.resolve(root, "../virastack.com/public/r");
  const outDir = path.resolve(root, process.argv[2] ?? (existsSync(site) ? site : "registry-dist"));
  const registry = buildRegistry(root);

  writeFileSync(path.join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
  shadcn(root, ["registry", "validate"]);
  shadcn(root, ["build", "registry.json", "--output", outDir]);
  // Without a target folder this is a release build, so the site's preview follows it.
  if (!process.argv[2]) syncSitePreview(root);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
