/**
 * Copies each module and the template's UI components to the preview on virastack.com, so the site
 * shows what `virastack add <name>` installs. The registry is the source; never edit the copy.
 *
 *   node scripts/sync-site-preview.js
 *
 * This script never ships in the npm package.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildItem, FEATURES } from "./build-registry.js";

const LAYERS = ["common", "nextjs"];
/** The site speaks two languages, so these previews use their i18n layer and its messages. */
const I18N_PREVIEWS = new Set(["users", "checkout-address", "checkout-card", "products"]);
/**
 * A module's message namespace the site already uses for its own text, renamed in the preview's
 * copy and in the messages merged into the site.
 */
const SITE_NAMESPACES = { products: { Products: "StartProducts" } };
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
    .replaceAll('"@/features/products/', `"@/${DEMOS.slice(4)}/products/`)
    .replaceAll('"@/components/ui/', `"@/${USERS_PREVIEW.slice(4)}/ui/`)
    .replaceAll('"@/lib/api"', `"@/${USERS_PREVIEW.slice(4)}/lib/api"`)
    .replaceAll('"@/lib/query-client"', `"@/${USERS_PREVIEW.slice(4)}/lib/query-client"`)
    .replaceAll('from "cn"', 'from "@/lib/utils"');
}

/** The products demo lives under the preview route, not at the module's own pages. */
const SITE_REWRITES = {
  "constants/products.constants.ts": [
    'export const PRODUCTS_ROUTE = "/products"',
    'export const PRODUCTS_ROUTE = "/start/preview/products"',
  ],
};

/** Applies the rewrite a preview file needs, and fails loudly when the module no longer matches it. */
function rewriteForSite(file, source) {
  const entry = Object.entries(SITE_REWRITES).find(([suffix]) => file.endsWith(suffix));
  if (!entry) return source;
  const [, [from, to]] = entry;
  if (!source.includes(from)) throw new Error(`${file} no longer has ${from}; update SITE_REWRITES`);
  return source.replace(from, to);
}

function copyFile(from, to, transform = toPreviewImports) {
  mkdirSync(path.dirname(to), { recursive: true });
  writeFileSync(to, transform(readFileSync(from, "utf8")));
}

/** The preview's copy reads the renamed namespace: `useTranslations("Products")` and the like. */
export function renameNamespaces(source, renames = {}) {
  return Object.entries(renames).reduce(
    (text, [from, to]) =>
      text.replace(
        new RegExp(`((?:useTranslations|getTranslations)(?:<|\\()|namespace: )"${from}"`, "g"),
        `$1"${to}"`,
      ),
    source,
  );
}

function copyTree(from, to, renames) {
  for (const entry of readdirSync(from)) {
    const source = path.join(from, entry);
    if (statSync(source).isDirectory()) copyTree(source, path.join(to, entry), renames);
    else if (!entry.includes(".test.")) {
      copyFile(source, path.join(to, entry), (text) =>
        renameNamespaces(rewriteForSite(source, toPreviewImports(text)), renames),
      );
    }
  }
}

/**
 * What `shadcn add` writes for a registry file in a lucide project: the registry's own imports
 * point at the project, and each icon placeholder becomes its lucide icon.
 */
export function toInstalledUi(source, style) {
  const icons = new Set();
  const body = source
    .replaceAll(`@/registry/${style}/ui/`, "@/components/ui/")
    .replace(/<IconPlaceholder\s+lucide="(\w+)"([\s\S]*?)\/>/g, (_, icon, rest) => {
      icons.add(icon);
      const props = rest.replace(/\s+(tabler|hugeicons|phosphor|remixicon)="[^"]*"/g, "");
      return `<${icon}${props}/>`;
    });
  const placeholder = /import \{ IconPlaceholder \} from "[^"]+"\n/;
  return icons.size === 0
    ? body.replace(placeholder, "")
    : body.replace(placeholder, `import { ${[...icons].sort().join(", ")} } from "lucide-react"\n`);
}

/**
 * The shadcn components a module brings itself (`ui` in FEATURES), in the template's style. No
 * template has them, so they come from shadcn's registry.
 */
async function copyModuleUi(root, preview) {
  const { style } = JSON.parse(readFileSync(path.join(root, "templates/nextjs/components.json"), "utf8"));
  for (const name of new Set(FEATURES.flatMap((feature) => feature.ui ?? []))) {
    const response = await fetch(`https://ui.shadcn.com/r/styles/${style}/${name}.json`);
    if (!response.ok) throw new Error(`shadcn has no ${style}/${name}: ${response.status}`);
    const { files } = /** @type {{ files: { content: string }[] }} */ (await response.json());
    const to = path.join(preview, "ui", `${name}.tsx`);
    mkdirSync(path.dirname(to), { recursive: true });
    writeFileSync(to, toPreviewImports(toInstalledUi(files[0].content, style)));
  }
}

/**
 * What the site's prompt is built from: the component a page of the reader's renders, and the
 * URLs of the pages the module brings itself (`/products/<id>` for `:id`), when it has any. The
 * page's Code tab reads the registry JSON itself.
 */
function writeInstallFiles(root, site) {
  for (const feature of FEATURES) {
    const pages = (buildItem(root, feature, "nextjs").meta.pages ?? []).map(({ path: url }) =>
      url.replace(/:(\w+)/g, "<$1>"),
    );
    writeFileSync(
      path.join(site, DEMOS, feature.name, "install-files.ts"),
      [
        "// Written by `npm run sync:preview` in the Start repo.",
        `export const INSTALL_ROUTE = ${JSON.stringify(feature.route)};`,
        `export const INSTALL_PAGES: readonly string[] = ${JSON.stringify(pages)};`,
        "",
      ].join("\n"),
    );
  }
}

/**
 * Adds a preview's messages to the site's own files, replacing its namespace there. A namespace
 * the site already has for itself, and the preview does not rename, stops the sync.
 */
function mergeSiteMessages(root, site, name, previewNamespaces) {
  const source = path.join(root, "registry", name, "nextjs-i18n/messages");
  const renames = SITE_NAMESPACES[name] ?? {};
  for (const file of readdirSync(source)) {
    const target = path.join(site, "src/messages", file);
    const current = JSON.parse(readFileSync(target, "utf8"));
    const incoming = Object.fromEntries(
      Object.entries(JSON.parse(readFileSync(path.join(source, file), "utf8"))).map(([key, value]) => [
        renames[key] ?? key,
        value,
      ]),
    );
    for (const key of Object.keys(incoming)) {
      if (key in current && !previewNamespaces.has(key)) {
        throw new Error(`The site already has a "${key}" namespace; add a rename to SITE_NAMESPACES`);
      }
    }
    writeFileSync(target, `${JSON.stringify({ ...current, ...incoming }, null, 2)}\n`);
  }
}

/** Every namespace the previews merge into the site, after their renames. */
function previewNamespacesOf(root) {
  return new Set(
    [...I18N_PREVIEWS].flatMap((name) => {
      const file = path.join(root, "registry", name, "nextjs-i18n/messages/en.json");
      const renames = SITE_NAMESPACES[name] ?? {};
      return Object.keys(JSON.parse(readFileSync(file, "utf8"))).map((key) => renames[key] ?? key);
    }),
  );
}

export async function syncSitePreview(root) {
  const site = path.resolve(root, "../virastack.com");
  if (!existsSync(site)) return false;
  const preview = path.join(site, USERS_PREVIEW);
  const shared = path.join(root, "templates-shared/src/lib");

  for (const { name } of FEATURES) {
    const demo = path.join(site, DEMOS, name);
    for (const folder of FOLDERS) rmSync(path.join(demo, folder), { recursive: true, force: true });
    for (const layer of I18N_PREVIEWS.has(name) ? I18N_LAYERS : LAYERS) {
      // Only the feature: a module's pages (`src/app`, `src/routes`) are the reader's routes, and the
      // site shows the demo on a preview page of its own.
      const source = path.join(root, "registry", name, layer, "src/features", name);
      if (existsSync(source)) copyTree(source, demo, SITE_NAMESPACES[name]);
    }
  }

  for (const name of UI) {
    copyFile(path.join(root, "templates/nextjs/src/components/ui", `${name}.tsx`), path.join(preview, "ui", `${name}.tsx`));
  }
  await copyModuleUi(root, preview);
  copyFile(path.join(shared, "query-client.ts"), path.join(preview, "lib/query-client.ts"));
  copyFile(path.join(shared, "api.ts"), path.join(preview, "lib/api.ts"), (source) =>
    toPreviewImports(source)
      .replace('import { siteConfig } from "@/config/site.config"\n\n', "")
      .replace("baseUrl: siteConfig.apiUrl", 'baseUrl: "https://dummyjson.com"'),
  );

  const previewNamespaces = previewNamespacesOf(root);
  for (const name of I18N_PREVIEWS) mergeSiteMessages(root, site, name, previewNamespaces);
  writeInstallFiles(root, site);

  spawnSync("npx", ["--no", "--", "prettier", "--write", DEMOS], { cwd: site, stdio: "ignore" });
  return true;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  console.log((await syncSitePreview(root)) ? "Site preview updated." : "virastack.com was not found next to this repo.");
}
