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

import { FEATURES } from "./build-registry.js";

const LAYERS = ["common", "nextjs"];
/** The site speaks two languages, so these previews use their i18n layer and its messages. */
const I18N_PREVIEWS = new Set(["users", "checkout-address", "checkout-card"]);
const I18N_LAYERS = ["common", "nextjs-i18n"];
const UI = [
  "alert-dialog",
  "avatar",
  "badge",
  "button",
  "checkbox",
  "dialog",
  "dropdown-menu",
  "empty",
  "field",
  "input",
  "label",
  "pagination",
  "radio-group",
  "select",
  "separator",
  "skeleton",
  "table",
  "textarea",
];
const FOLDERS = ["api", "components", "constants", "helpers", "hooks", "schemas", "stores"];
const DEMOS = "src/features/start/demos";
const USERS_PREVIEW = `${DEMOS}/users`;

/** Every demo shares the UI and API copies in the users preview. */
export function toPreviewImports(source) {
  return source
    .replaceAll('"@/features/users/', `"@/${USERS_PREVIEW.slice(4)}/`)
    .replaceAll('"@/features/checkout-address/', `"@/${DEMOS.slice(4)}/checkout-address/`)
    .replaceAll('"@/features/checkout-card/', `"@/${DEMOS.slice(4)}/checkout-card/`)
    .replaceAll('"@/components/ui/', `"@/${USERS_PREVIEW.slice(4)}/ui/`)
    .replaceAll('"@/lib/api"', `"@/${USERS_PREVIEW.slice(4)}/lib/api"`)
    .replaceAll('"@/lib/query-client"', `"@/${USERS_PREVIEW.slice(4)}/lib/query-client"`)
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
    else if (!entry.includes(".test.")) copyFile(source, path.join(to, entry));
  }
}

/** The route each page's install steps are built from. The page's Code tab reads the registry JSON itself. */
function writeInstallFiles(site) {
  for (const { name, route } of FEATURES) {
    writeFileSync(
      path.join(site, DEMOS, name, "install-files.ts"),
      [
        "// Written by `npm run sync:preview` in the Start repo.",
        `export const INSTALL_ROUTE = ${JSON.stringify(route)};`,
        "",
      ].join("\n"),
    );
  }
}

/** Adds a preview's messages to the site's own files, replacing its namespace there. */
function mergeSiteMessages(root, site, name) {
  const source = path.join(root, "registry", name, "nextjs-i18n/messages");
  for (const file of readdirSync(source)) {
    const target = path.join(site, "src/messages", file);
    const messages = { ...JSON.parse(readFileSync(target, "utf8")), ...JSON.parse(readFileSync(path.join(source, file), "utf8")) };
    writeFileSync(target, `${JSON.stringify(messages, null, 2)}\n`);
  }
}

export function syncSitePreview(root) {
  const site = path.resolve(root, "../virastack.com");
  if (!existsSync(site)) return false;
  const preview = path.join(site, USERS_PREVIEW);
  const shared = path.join(root, "templates-shared/src/lib");

  for (const { name } of FEATURES) {
    const demo = path.join(site, DEMOS, name);
    for (const folder of FOLDERS) rmSync(path.join(demo, folder), { recursive: true, force: true });
    for (const layer of I18N_PREVIEWS.has(name) ? I18N_LAYERS : LAYERS) {
      const source = path.join(root, "registry", name, layer, "src/features", name);
      if (existsSync(source)) copyTree(source, demo);
    }
  }

  for (const name of UI) {
    copyFile(path.join(root, "templates/nextjs/src/components/ui", `${name}.tsx`), path.join(preview, "ui", `${name}.tsx`));
  }
  copyFile(path.join(shared, "query-client.ts"), path.join(preview, "lib/query-client.ts"));
  copyFile(path.join(shared, "api.ts"), path.join(preview, "lib/api.ts"), (source) =>
    toPreviewImports(source)
      .replace('import { siteConfig } from "@/config/site.config"\n\n', "")
      .replace("baseUrl: siteConfig.apiUrl", 'baseUrl: "https://dummyjson.com"'),
  );

  for (const name of I18N_PREVIEWS) mergeSiteMessages(root, site, name);
  writeInstallFiles(site);

  spawnSync("npx", ["--no", "--", "prettier", "--write", DEMOS], { cwd: site, stdio: "ignore" });
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  console.log(syncSitePreview(root) ? "Site preview updated." : "virastack.com was not found next to this repo.");
}
