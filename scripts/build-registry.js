/**
 * Keeps `registry.json` in step with `registry/<name>` and the templates, then builds it with shadcn:
 * shared files in `common`, framework files and routes in `nextjs` and `tanstack`.
 *
 *   node scripts/build-registry.js [outDir]    default: registry-dist
 *
 * The output is what virastack.com serves at /r. This script never ships in the npm package.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SHADCN } from "../src/utils/features.js";

const SCHEMA = "https://ui.shadcn.com/schema/registry.json";
const AUTHOR = "ViraStack <https://virastack.com>";

/** Provided by every template, so an item never lists them. */
const BUILT_IN = new Set(["react", "react-dom", "next", "@tanstack/react-router", "@tanstack/react-start"]);

export const FEATURES = [
  {
    name: "users",
    title: "Users",
    description: "A searchable user list with pagination in the URL, a validated form and favorites.",
    frameworks: ["nextjs", "tanstack"],
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

export function buildItem(root, feature, framework) {
  const template = path.join(root, "templates", framework);
  const source = path.posix.join("registry", feature.name);
  const pkg = JSON.parse(readFileSync(path.join(template, "package.json"), "utf8"));
  const files = ["common", framework]
    .flatMap((layer) =>
      listFiles(path.join(root, source, layer), "src").map((target) => ({
        path: path.posix.join(source, layer, target),
        type: "registry:file",
        target,
      })),
    )
    .sort((a, b) => a.target.localeCompare(b.target));

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
    meta: { product: "virastack-start", framework },
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
  const outDir = path.resolve(root, process.argv[2] ?? "registry-dist");
  const registry = buildRegistry(root);

  writeFileSync(path.join(root, "registry.json"), `${JSON.stringify(registry, null, 2)}\n`);
  shadcn(root, ["registry", "validate"]);
  shadcn(root, ["build", "registry.json", "--output", outDir]);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
