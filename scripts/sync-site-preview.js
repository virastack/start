/**
 * Copies the users module and the template's UI components to the preview on virastack.com, so the
 * site shows what `virastack add users` installs. The registry is the source; never edit the copy.
 *
 *   node scripts/sync-site-preview.js
 *
 * This script never ships in the npm package.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LAYERS = ["common", "nextjs"];
const UI = [
  "avatar",
  "badge",
  "button",
  "dialog",
  "empty",
  "field",
  "input",
  "label",
  "pagination",
  "separator",
  "skeleton",
  "table",
];
const FOLDERS = ["api", "components", "constants", "helpers", "hooks", "schemas", "stores"];
/** The template's page frame; the site has its own. */
const SKIPPED = new Set(["UsersPage.tsx"]);
const PREVIEW = "src/features/start/demos/users";

export function toPreviewImports(source) {
  return source
    .replaceAll('"@/features/users/', `"@/${PREVIEW.slice(4)}/`)
    .replaceAll('"@/components/ui/', `"@/${PREVIEW.slice(4)}/ui/`)
    .replaceAll('"@/lib/api"', `"@/${PREVIEW.slice(4)}/lib/api"`)
    .replaceAll('"@/lib/query-client"', `"@/${PREVIEW.slice(4)}/lib/query-client"`)
    .replaceAll('from "cn"', 'from "@/lib/utils"');
}

function copyFile(from, to, transform = toPreviewImports) {
  mkdirSync(path.dirname(to), { recursive: true });
  writeFileSync(to, transform(readFileSync(from, "utf8")));
}

function copyTree(from, to) {
  for (const entry of readdirSync(from)) {
    const source = path.join(from, entry);
    if (statSync(source).isDirectory()) copyTree(source, path.join(to, entry));
    else if (!entry.includes(".test.") && !SKIPPED.has(entry)) copyFile(source, path.join(to, entry));
  }
}

/** The list behind the page's file tree, so it always matches what `virastack add` installs. */
function writeInstallFiles(root, preview) {
  const registry = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8"));
  const targets = (name) => registry.items.find((item) => item.name === name).files.map(({ target }) => target);
  const tanstack = new Set(targets("users-tanstack"));
  // Only what both frameworks share: the route differs, and the page says so in a note.
  const files = targets("users-nextjs")
    .filter((target) => target.startsWith("src/features/") && tanstack.has(target))
    .sort();
  writeFileSync(
    path.join(preview, "install-files.ts"),
    `// Written by \`npm run sync:preview\` in the Start repo.\nexport const USERS_INSTALL_FILES = ${JSON.stringify(files)};\n`,
  );
}

export function syncSitePreview(root) {
  const site = path.resolve(root, "../virastack.com");
  if (!existsSync(site)) return false;
  const preview = path.join(site, PREVIEW);
  const shared = path.join(root, "templates-shared/src/lib");

  for (const folder of FOLDERS) rmSync(path.join(preview, folder), { recursive: true, force: true });
  for (const layer of LAYERS) copyTree(path.join(root, "registry/users", layer, "src/features/users"), preview);

  for (const name of UI) {
    copyFile(path.join(root, "templates/nextjs/src/components/ui", `${name}.tsx`), path.join(preview, "ui", `${name}.tsx`));
  }
  copyFile(path.join(shared, "query-client.ts"), path.join(preview, "lib/query-client.ts"));
  copyFile(path.join(shared, "api.ts"), path.join(preview, "lib/api.ts"), (source) =>
    toPreviewImports(source)
      .replace('import { siteConfig } from "@/config/site.config"\n\n', "")
      .replace("baseUrl: siteConfig.apiUrl", 'baseUrl: "https://dummyjson.com"'),
  );

  writeInstallFiles(root, preview);

  spawnSync("npx", ["--no", "--", "prettier", "--write", PREVIEW], { cwd: site, stdio: "ignore" });
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  console.log(syncSitePreview(root) ? "Site preview updated." : "virastack.com was not found next to this repo.");
}
