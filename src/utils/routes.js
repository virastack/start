/**
 * The URL a route file answers, read from its path alone. It knows the file conventions of the two
 * templates, enough to tell when two files claim the same URL; it does not resolve routes the way
 * the frameworks do. Dynamic segments come out as `:name`, catch-alls as `*`, and the optional
 * ones as `:name?` and `*?`, which also answer the URL without them.
 */

const NEXT_DIR = "src/app/";
const PAGES_DIRS = ["src/pages/", "pages/"];
const TANSTACK_DIR = "src/routes/";
const NEXT_ROUTE_FILE = /^(page|route)\.(tsx|ts|jsx|js|mdx|md)$/;
const PAGES_FILE = /\.(tsx|ts|jsx|js|mdx|md)$/;
const SCRIPT_FILE = /\.(tsx|ts|jsx|js)$/;

/** `[id]` is `:id`, `[...slug]` is `*` and `[[...slug]]` is `*?`. */
function nextSegment(segment) {
  if (/^\[\[\.\.\.[^\]]+\]\]$/.test(segment)) return "*?";
  if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return "*";
  const dynamic = /^\[([^\]]+)\]$/.exec(segment);
  return dynamic ? `:${dynamic[1]}` : segment;
}

/** The i18n template's locale prefix is optional in the URL (`as-needed`), so it is left out there. */
function withoutLocale(parts, i18n) {
  return i18n && parts[0] === "[locale]" ? parts.slice(1) : parts;
}

function nextRoute(file, i18n) {
  const parts = file.slice(NEXT_DIR.length).split("/");
  if (!NEXT_ROUTE_FILE.test(parts.pop())) return null;
  const segments = [];
  for (const part of withoutLocale(parts, i18n)) {
    // Private folders are not routes; slots and intercepting routes render beside another page.
    if (part.startsWith("_") || part.startsWith("@") || part.startsWith("(.")) return null;
    if (/^\(.+\)$/.test(part)) continue;
    segments.push(nextSegment(part));
  }
  return `/${segments.join("/")}`;
}

/** The Pages Router: every file is a page, `index` is its folder, `_app` and the like are not pages. */
function pagesRoute(file, dir, i18n) {
  if (!PAGES_FILE.test(file)) return null;
  const parts = file.slice(dir.length).replace(PAGES_FILE, "").split("/");
  if (parts.some((part) => part.startsWith("_"))) return null;
  if (parts.at(-1) === "index") parts.pop();
  return `/${withoutLocale(parts, i18n).map(nextSegment).join("/")}`;
}

/** Splits `posts.$id[.]json` at its dots, but not at a dot escaped in brackets. */
function splitFlat(name) {
  return name.match(/(?:\[[^\]]*\]|[^.])+/g) ?? [];
}

/**
 * `$id`, `{$id}` and `a{$id}b` are `:id`, `$` alone is `*`, an optional `{-$id}` is `:id?`,
 * `_layout` and `(group)` add no segment, `posts_` is `posts`, and `[.]` escapes the dot.
 */
function tanstackSegment(token) {
  if (/^\(.+\)$/.test(token) || token.startsWith("_")) return null;
  const optional = /\{-\$([^}]+)\}/.exec(token);
  if (optional) return `:${optional[1]}?`;
  if (token === "$") return "*";
  const dynamic = /\{?\$([^{}$]+?)\}?$/.exec(token) ?? /\{\$([^}]+)\}/.exec(token);
  if (dynamic) return `:${dynamic[1]}`;
  return token.replace(/_$/, "").replace(/\[([^\]]*)\]/g, "$1");
}

/** The file's dot-separated parts, from `src/routes/products/$id.tsx` to `products`, `$id`. */
function tanstackTokens(file) {
  const parts = file.slice(TANSTACK_DIR.length).replace(SCRIPT_FILE, "").split("/");
  return parts.flatMap((part) => splitFlat(part));
}

function tanstackRoute(file, i18n) {
  if (!SCRIPT_FILE.test(file)) return null;
  const parts = file.slice(TANSTACK_DIR.length).replace(SCRIPT_FILE, "").split("/");
  // `-` keeps a file or folder out of the route tree; `__root` is the app shell, not a page.
  if (parts.some((part) => part.startsWith("-")) || parts.at(-1) === "__root") return null;
  const tokens = tanstackTokens(file);
  // A lazy file is the second half of the route of the same name.
  if (tokens.at(-1) === "lazy") tokens.pop();
  // `route` names its folder's own route; whether that is a page or a layout is up to its code.
  if (tokens.at(-1) === "route") tokens.pop();
  // A pathless `_layout` only wraps the routes under it.
  if (tokens.at(-1)?.startsWith("_")) return null;
  if (tokens.at(-1) === "index") tokens.pop();
  // The i18n template's `{-$lang}` prefix is optional in its URLs, so it is left out there.
  if (i18n && /^\{-\$[^}]+\}$/.test(tokens[0] ?? "")) tokens.shift();
  const segments = tokens.map(tanstackSegment).filter((segment) => segment !== null);
  return `/${segments.join("/")}`;
}

/**
 * The URL pattern of a route file such as `src/app/(shop)/products/[id]/page.tsx`,
 * `pages/products/[id].tsx` or `src/routes/{-$lang}/products.$id.tsx` (all `/products/:id`), or
 * `null` for a file that is not a route. Paths use `/`. `i18n` leaves out the Next.js `[locale]`
 * folder, which is optional in the i18n template's URLs.
 * @param {string} file
 * @param {{ i18n?: boolean }} [options]
 * @returns {string | null}
 */
export function toRoutePath(file, { i18n = false } = {}) {
  const normalized = file.replaceAll("\\", "/");
  if (normalized.startsWith(NEXT_DIR)) return nextRoute(normalized, i18n);
  const pagesDir = PAGES_DIRS.find((dir) => normalized.startsWith(dir));
  if (pagesDir) return pagesRoute(normalized, pagesDir, i18n);
  if (normalized.startsWith(TANSTACK_DIR)) return tanstackRoute(normalized, i18n);
  return null;
}

/**
 * Whether a TanStack route file only wraps the routes under it: a `route.tsx`, or a flat route such
 * as `products.tsx` with routes under it (`products/…` or `products.*.tsx`), that renders an
 * `<Outlet />`. Without one it is a page, and the routes under it never show. `files` are the
 * project's route files and `source` is this file's code.
 */
export function isTanstackLayout(file, files, source) {
  const normalized = file.replaceAll("\\", "/");
  if (!normalized.startsWith(TANSTACK_DIR) || !SCRIPT_FILE.test(normalized)) return false;
  if (!/<Outlet\b/.test(source)) return false;
  const base = normalized.replace(SCRIPT_FILE, "");
  if (/(^|\/|\.)route$/.test(base)) return true;
  if (/(^|\/|\.)(index|lazy)$/.test(base)) return false;
  return files.some((other) => {
    const candidate = other.replaceAll("\\", "/");
    return candidate !== normalized && (candidate.startsWith(`${base}/`) || candidate.startsWith(`${base}.`)) && !candidate.startsWith(`${base}.lazy.`);
  });
}

/** The folders a template keeps its routes in; the Next.js Pages Router counts too. */
export function routesDirs(template) {
  return template === "tanstack" ? [TANSTACK_DIR.slice(0, -1)] : [NEXT_DIR.slice(0, -1), ...PAGES_DIRS.map((dir) => dir.slice(0, -1))];
}

/** A file in the routes folder, which is the module's page and not part of its feature. */
export function isRouteFile(target) {
  return target.startsWith(NEXT_DIR) || target.startsWith(TANSTACK_DIR);
}

/** The URLs a pattern answers, as keys: an optional segment answers with and without itself. */
function routeKeys(route) {
  let keys = [""];
  for (const segment of route.split("/").filter(Boolean)) {
    const options =
      segment === "*?" ? ["", "*"] : segment.endsWith("?") ? ["", ":"] : [segment.startsWith(":") ? ":" : segment];
    keys = keys.flatMap((key) => options.map((option) => (option ? `${key}/${option}` : key)));
  }
  return keys.map((key) => key || "/");
}

/** Two patterns are the same URL when they differ only in the names of their dynamic segments. */
export function isSameRoute(left, right) {
  const rightKeys = routeKeys(right);
  return routeKeys(left).some((key) => rightKeys.includes(key));
}
