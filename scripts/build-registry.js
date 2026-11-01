/**
 * Builds shadcn registry items for `virastack add` from the templates.
 *
 *   node scripts/build-registry.js [outDir]    default: registry-dist
 *
 * The output is what virastack.com serves at /r/v2/<name>.json. This script never ships in the
 * npm package.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA = "https://ui.shadcn.com/schema/registry-item.json";

/** Provided by every template, so an item never lists them. */
const BUILT_IN = new Set(["react", "react-dom", "next", "@tanstack/react-router", "@tanstack/react-start"]);

export const FEATURES = [
  {
    name: "users",
    title: "Users",
    description: "A searchable user list with pagination in the URL, a validated form and favorites.",
    paths: { nextjs: ["src/app/users"], tanstack: ["src/routes/users.tsx"] },
    folder: "src/features/users",
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

function listPath(root, rel) {
  return rel.endsWith(".tsx") || rel.endsWith(".ts") ? [rel] : listFiles(root, rel);
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
  const pkg = JSON.parse(readFileSync(path.join(template, "package.json"), "utf8"));
  const paths = [
    ...listFiles(template, feature.folder),
    ...feature.paths[framework].flatMap((rel) => listPath(template, rel)),
  ].sort();
  const files = paths.map((rel) => ({
    path: rel,
    target: rel,
    type: "registry:file",
    content: readFileSync(path.join(template, rel), "utf8"),
  }));

  return {
    $schema: SCHEMA,
    name: `${feature.name}-${framework}`,
    type: "registry:item",
    title: feature.title,
    description: feature.description,
    ...findDependencies(
      files.map((file) => file.content),
      pkg,
    ),
    files,
  };
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const outDir = path.resolve(root, process.argv[2] ?? "registry-dist");
  mkdirSync(outDir, { recursive: true });

  for (const feature of FEATURES) {
    for (const framework of Object.keys(feature.paths)) {
      const item = buildItem(root, feature, framework);
      writeFileSync(path.join(outDir, `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
      console.log(`${item.name}: ${item.files.length} files, ${item.dependencies.length} packages`);
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
