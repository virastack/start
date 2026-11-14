import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import { runCommand } from "./exec.js";
import { getDlxCommand, getExecCommand } from "./package-manager.js";
import { isRouteFile, isSameRoute, isTanstackLayout, routesDirs, toRoutePath } from "./routes.js";

const DEFAULT_REGISTRY = "https://virastack.com/r";
export const FEATURES_URL = "https://virastack.com/start/features";
/** The version the registry was last tested with. Raised on purpose, never `latest`. */
export const SHADCN = "shadcn@4.23.0";
const MESSAGES_DIR = "src/messages";
const UI_DIR = "src/components/ui";

const VALID_ID = /^[a-z0-9-]+$/;
const ITEM_SUFFIX = /-(nextjs|tanstack)(-i18n)?$/;
/** `src/features`, `src/app` and `src/routes` are the project's own folders, even when they are empty. */
const KEPT_FOLDER_DEPTH = 2;
/** The i18n templates' locale folders hold the project's own layout and pages. */
const KEPT_FOLDERS = new Set(["src/app/[locale]", "src/routes/{-$lang}"]);

export class FeatureNotFoundError extends Error {
  name = "FeatureNotFoundError";
}

export class RegistryUnavailableError extends Error {
  name = "RegistryUnavailableError";
}

export class StartTooOldError extends Error {
  name = "StartTooOldError";

  constructor(required, current) {
    super(`Needs Start ${required}, this project uses ${current}`);
    this.required = required;
    this.current = current;
  }
}

/** Compares `major.minor.patch`. A version it cannot read counts as older than any other. */
export function isOlderVersion(version, than) {
  const parse = (value) => String(value).split(".").map(Number);
  const [left, right] = [parse(version), parse(than)];
  if (left.some(Number.isNaN)) return true;
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference < 0;
  }
  return false;
}

export function getRegistryUrl() {
  return process.env.VIRASTACK_REGISTRY_URL ?? DEFAULT_REGISTRY;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readProjectInfo(cwd) {
  const pkg = JSON.parse(await fs.readFile(path.join(cwd, "package.json"), "utf8"));
  return {
    template: pkg.virastack?.template,
    i18n: pkg.virastack?.i18n === true,
    version: pkg.virastack?.version,
  };
}

/** The registry is read on every run, so a new module needs no CLI release. */
async function loadRegistryFile(file, timeout = 15_000) {
  const base = getRegistryUrl();
  if (!/^https?:/.test(base)) {
    const filePath = path.join(base, file);
    if (!(await exists(filePath))) return null;
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  }

  let response;
  try {
    response = await fetch(`${base}/${file}`, { signal: AbortSignal.timeout(timeout) });
  } catch (error) {
    throw new RegistryUnavailableError(`Could not reach ${base}`, { cause: error });
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new RegistryUnavailableError(`${base} answered ${response.status}`);
  return response.json();
}

/**
 * The modules the registry offers now, only those for `template` when it is given. Empty when the
 * registry cannot be reached.
 * @param {{ timeout?: number, template?: string, i18n?: boolean }} [options]
 */
export async function listFeatures({ timeout, template, i18n = false } = {}) {
  const suffix = template ? `-${template}${i18n ? "-i18n" : ""}` : null;
  try {
    const registry = await loadRegistryFile("registry.json", timeout);
    const items = (registry?.items ?? []).filter((item) => !suffix || item.name.endsWith(suffix));
    const ids = items.map((item) => item.name.replace(ITEM_SUFFIX, ""));
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

/**
 * A feature that cannot be installed without touching what the project already has: files and
 * messages of the same name in `conflicts`, route files for the same URL as a page of the module in
 * `routes`, and paths a symbolic link would take outside the project in `links`. `pages` says only
 * the module's pages are in the way, which `--no-pages` gets around.
 */
export class FeatureConflictError extends Error {
  /**
   * @param {string[]} conflicts
   * @param {{ routes?: string[], links?: string[], pages?: boolean }} [options]
   */
  constructor(conflicts, { routes = [], links = [], pages = false } = {}) {
    super([...conflicts, ...routes, ...links].join(", "));
    this.name = "FeatureConflictError";
    this.conflicts = conflicts;
    this.routes = routes;
    this.links = links;
    this.pages = pages;
  }
}

function isGroup(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Every message of `incoming` with what the project has for it: present, missing or conflict. */
export function compareMessages(current, incoming, prefix = "") {
  return Object.entries(incoming).flatMap(([key, value]) => {
    const name = `${prefix}${key}`;
    if (!isGroup(value)) {
      if (!(key in current)) return [{ name, state: "missing" }];
      return [{ name, state: isGroup(current[key]) ? "conflict" : "present" }];
    }
    if (key in current && !isGroup(current[key])) return [{ name, state: "conflict" }];
    return compareMessages(current[key] ?? {}, value, `${name}.`);
  });
}

/** Only ever adds: the project's own messages stay as they are. */
export function mergeMessages(current, incoming) {
  const merged = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    merged[key] = isGroup(value) ? mergeMessages(merged[key] ?? {}, value) : (merged[key] ?? value);
  }
  return merged;
}

async function existingTargets(files, cwd) {
  const checks = await Promise.all(files.map((file) => exists(path.join(cwd, file.target))));
  return files.filter((_, index) => checks[index]).map((file) => file.target);
}

async function lstatOrNull(filePath) {
  try {
    return await fs.lstat(filePath);
  } catch {
    return null;
  }
}

/** shadcn drops `.js` from `@/` imports while installing, so that alone is not a change. */
function toComparable(source) {
  return source.replace(/\r\n/g, "\n").replace(/(from "@\/[^"]+)\.js"/g, '$1"');
}

async function hasContent(filePath, content) {
  try {
    return toComparable(await fs.readFile(filePath, "utf8")) === toComparable(content ?? "");
  } catch {
    return false;
  }
}

/**
 * Whether writing `target` lands inside the project. A symlinked folder on the way can point
 * anywhere, so the deepest part of the path that exists is resolved.
 */
async function writesInsideProject(target, cwd) {
  const root = await fs.realpath(cwd);
  let current = path.resolve(cwd, target);
  while (!(await lstatOrNull(current))) current = path.dirname(current);
  const real = await fs.realpath(current).catch(() => null);
  return real !== null && (real === root || real.startsWith(`${root}${path.sep}`));
}

/** Every file under the routes folders, with `/` between its parts. */
async function listRouteFiles(cwd, template) {
  const lists = await Promise.all(
    routesDirs(template).map(async (dir) => {
      if (!(await exists(path.join(cwd, dir)))) return [];
      const entries = await fs.readdir(path.join(cwd, dir), { recursive: true });
      return entries.map((entry) => `${dir}/${entry.replaceAll("\\", "/")}`);
    }),
  );
  return lists.flat();
}

/**
 * The project's route files that answer the same URL as one of `pages`, such as
 * `src/app/(shop)/products/page.tsx` for `/products`. `own` are all of the module's page paths,
 * which `planFiles` checks as files. A TanStack layout that renders an `<Outlet />` is not a page.
 */
export async function findRouteConflicts(pages, cwd, { template, i18n = false, own = pages.map((page) => page.target) }) {
  const ownFiles = new Set(own);
  const routes = pages.map((page) => toRoutePath(page.target, { i18n })).filter(Boolean);
  const files = await listRouteFiles(cwd, template);
  const conflicts = [];
  for (const file of files) {
    if (ownFiles.has(file)) continue;
    const route = toRoutePath(file, { i18n });
    if (!route || !routes.some((page) => isSameRoute(page, route))) continue;
    if (template === "tanstack") {
      const source = await fs.readFile(path.join(cwd, file), "utf8").catch(() => "");
      if (isTanstackLayout(file, files, source)) continue;
    }
    conflicts.push(`${file}: ${route}`);
  }
  return conflicts.sort();
}

/**
 * All or nothing for the feature's files: only a part of them means the project has its own code
 * there. The pages count apart, because `--no-pages` leaves them out.
 *
 * - A fresh install is strict: a page file with other content than the module's, or another route
 *   for one of its URLs, stops it (a page with the module's own content is the module's).
 * - Once the feature is in, `add` never fails over pages: those that exist stay as they are, a
 *   missing one is added, and one whose URL a route of the project answers is left out
 *   (`skippedPages`).
 */
export async function planFiles(item, cwd, { template, i18n = false, pages = true }) {
  const featureFiles = item.files.filter((file) => !isRouteFile(file.target));
  const pageFiles = item.files.filter((file) => isRouteFile(file.target));
  const existing = await existingTargets(featureFiles, cwd);
  const installed = existing.length === featureFiles.length;
  const conflicts = installed || existing.length === 0 ? [] : existing;

  const pageWrites = [];
  const pageConflicts = [];
  const routes = [];
  const skippedPages = [];
  if (pages) {
    const own = pageFiles.map((page) => page.target);
    for (const page of pageFiles) {
      const filePath = path.join(cwd, page.target);
      if (await exists(filePath)) {
        if (!installed && !(await hasContent(filePath, page.content))) pageConflicts.push(page.target);
        continue;
      }
      const answered = await findRouteConflicts([page], cwd, { template, i18n, own });
      if (answered.length === 0) pageWrites.push(page);
      else if (installed) skippedPages.push({ file: page.target, routes: answered });
      else routes.push(...answered.filter((route) => !routes.includes(route)));
    }
  }
  // A file beside a page that is not a page itself, such as Next.js `not-found.tsx`, goes with it.
  const skippedFolders = skippedPages.map(({ file }) => path.posix.dirname(file));
  const pageTargets = pageWrites.filter(
    (page) => toRoutePath(page.target, { i18n }) !== null || !skippedFolders.includes(path.posix.dirname(page.target)),
  );
  return {
    installed,
    conflicts: [...conflicts, ...pageConflicts],
    routes: routes.sort(),
    // Only the pages are in the way, so the feature alone (`--no-pages`) would go in.
    onlyPages: conflicts.length === 0 && pageConflicts.length + routes.length > 0,
    writes: [...(installed ? [] : featureFiles), ...pageTargets],
    writesPages: pageTargets.length > 0,
    skippedPages,
  };
}

async function readJson(filePath, name) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${name} could not be read: ${error instanceof Error ? error.message : String(error)}`, { cause: error });
  }
}

/** Reads every message file, so a broken one stops the install before anything is written. */
async function planMessages(item, cwd) {
  const messages = item.meta?.messages;
  if (!messages) return { writes: [], untranslated: [], conflicts: [] };

  const dir = path.join(cwd, MESSAGES_DIR);
  if (!(await exists(dir))) throw new Error(`${MESSAGES_DIR} was not found, so ${item.name} has nowhere to add its messages.`);
  const files = (await fs.readdir(dir)).filter((file) => file.endsWith(".json"));
  const writes = [];
  const untranslated = [];
  const conflicts = [];

  for (const file of files) {
    const locale = path.basename(file, ".json");
    const incoming = messages[locale] ?? messages.en;
    if (!messages[locale]) untranslated.push(locale);

    const filePath = path.join(dir, file);
    const current = await readJson(filePath, `${MESSAGES_DIR}/${file}`);
    const compared = compareMessages(current, incoming);
    const present = compared.filter(({ state }) => state === "present");
    const isMixed = present.length > 0 && present.length < compared.length;
    conflicts.push(
      ...compared
        .filter(({ state }) => state === "conflict" || (isMixed && state === "present"))
        .map(({ name }) => `${MESSAGES_DIR}/${file}: ${name}`),
    );
    if (present.length === 0) {
      writes.push({ filePath, content: `${JSON.stringify(mergeMessages(current, incoming), null, 2)}\n` });
    }
  }
  return { writes, untranslated: writes.length > 0 ? untranslated : [], conflicts };
}

/** Best effort: the messages work either way, but the project's own format check expects this. */
async function formatFiles(packageManager, files, cwd) {
  const [command, ...prefix] = getExecCommand(packageManager);
  try {
    await runCommand(command, [...prefix, "prettier", "--write", ...files], { cwd });
  } catch {
    // A project without Prettier has no format to keep.
  }
}

async function loadItem(id, template, i18n) {
  const item = VALID_ID.test(id)
    ? await loadRegistryFile(`${id}-${template}${i18n ? "-i18n" : ""}.json`)
    : null;
  if (!item) throw new FeatureNotFoundError(id);
  return item;
}

/**
 * The shadcn components a module needs that no template ships (`registryDependencies`), and that
 * this project does not have yet. shadcn adds them; a component the project has stays untouched.
 */
export async function findMissingUi(item, cwd) {
  const names = (item.registryDependencies ?? []).filter((name) => VALID_ID.test(name));
  const checks = await Promise.all(names.map((name) => exists(path.join(cwd, UI_DIR, `${name}.tsx`))));
  return names.filter((_, index) => !checks[index]);
}

const SHADCN_STYLES_URL = "https://ui.shadcn.com/r/styles";

async function fetchShadcnItem(style, name) {
  let response;
  try {
    response = await fetch(`${SHADCN_STYLES_URL}/${style}/${name}.json`, { signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    throw new RegistryUnavailableError(`Could not reach ${SHADCN_STYLES_URL}`, { cause: error });
  }
  if (!response.ok) throw new RegistryUnavailableError(`shadcn has no ${style}/${name}: ${response.status}`);
  return response.json();
}

/**
 * shadcn's items for the missing components and for the components those need in turn, the
 * missing ones only. Handing shadcn a dependency the project already has would make it ask to
 * overwrite that file, and without an answer it writes nothing at all.
 */
export async function resolveMissingUi(names, cwd, fetchItem = fetchShadcnItem) {
  const { style } = await readJson(path.join(cwd, "components.json"), "components.json");
  const seen = new Set();
  const items = [];
  const visit = async (name) => {
    if (seen.has(name) || !VALID_ID.test(name)) return;
    seen.add(name);
    if (await exists(path.join(cwd, UI_DIR, `${name}.tsx`))) return;
    const item = await fetchItem(style, name);
    items.push({ name, item });
    for (const dependency of item.registryDependencies ?? []) await visit(dependency);
  };
  for (const name of names) await visit(name);
  return items;
}

/** The module with its missing components' files inlined, so shadcn resolves nothing itself. */
export function withUi(item, uiItems) {
  const merge = (key) => [...new Set([item, ...uiItems.map((ui) => ui.item)].flatMap((entry) => entry[key] ?? []))];
  return {
    ...item,
    registryDependencies: [],
    dependencies: merge("dependencies"),
    devDependencies: merge("devDependencies"),
    files: [...item.files, ...uiItems.flatMap((ui) => ui.item.files ?? [])],
  };
}

/**
 * Paraglide compiles the messages, and TanStack Router lists the routes in `src/routeTree.gen.ts`,
 * each only when what it reads changed. The files are in place by then, so either one failing is a
 * warning (`messages` or `routeTree`: `"missing" | "failed"`), not a failed install.
 */
async function refreshGenerated({ cwd, packageManager, template, i18n, routes = false, messages = false }) {
  if (template !== "tanstack") return {};
  const result = {};
  if (i18n && messages) {
    try {
      await runCommand(packageManager, ["run", "postinstall"], { cwd });
    } catch {
      result.messages = "failed";
    }
  }
  if (!routes) return result;

  const { scripts = {} } = await readJson(path.join(cwd, "package.json"), "package.json");
  if (!scripts["generate-routes"]) return { ...result, routeTree: "missing" };
  try {
    await runCommand(packageManager, ["run", "generate-routes"], { cwd });
    return { ...result, routeTree: "updated" };
  } catch {
    return { ...result, routeTree: "failed" };
  }
}

/**
 * @typedef {object} InstallResult
 * @property {boolean} alreadyInstalled
 * @property {string[]} untranslated
 * @property {boolean} [pagesAdded]
 * @property {{ name: string, file: string }} [entry]
 * @property {{ path: string, file: string }[]} [pages]
 * @property {string} [routeTree]
 * @property {string} [messages]
 * @property {{ file: string, routes: string[] }[]} [skippedPages]
 */

/**
 * Installs a feature with shadcn and merges its messages. Checks everything first, so a conflict
 * changes nothing. Throws FeatureConflictError for one. `pages: false` leaves the module's pages
 * out, for a project that has its own at their URLs.
 * @returns {Promise<InstallResult>}
 */
export async function installFeature(id, { cwd, packageManager, template, i18n = false, isYarnClassic, pages = true }) {
  const item = await loadItem(id, template, i18n);

  const required = item.meta?.minStartVersion;
  if (required) {
    const { version } = await readProjectInfo(cwd);
    if (isOlderVersion(version, required)) throw new StartTooOldError(required, version ?? "?");
  }

  const files = await planFiles(item, cwd, { template, i18n, pages });
  const messages = await planMessages(item, cwd);

  const conflicts = [...files.conflicts, ...messages.conflicts];
  if (conflicts.length > 0 || files.routes.length > 0) {
    const pagesOnly = files.onlyPages && messages.conflicts.length === 0;
    throw new FeatureConflictError(conflicts, { routes: files.routes, pages: pagesOnly });
  }
  // Pages a route of the project already answers, left out of an installed module.
  const skipped = files.skippedPages.length > 0 ? { skippedPages: files.skippedPages } : {};
  if (files.writes.length === 0 && messages.writes.length === 0) {
    return { alreadyInstalled: true, untranslated: [], ...skipped };
  }

  const links = [];
  for (const { target } of files.writes) {
    if (!(await writesInsideProject(target, cwd))) links.push(target);
  }
  if (links.length > 0) throw new FeatureConflictError([], { links });

  if (files.writes.length > 0) {
    const uiItems = await resolveMissingUi(await findMissingUi(item, cwd), cwd);
    const missingUi = uiItems.map(({ name }) => name);
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "virastack-add-"));
    const itemPath = path.join(dir, `${item.name}.json`);
    try {
      await fs.writeFile(itemPath, JSON.stringify(withUi({ ...item, files: files.writes }, uiItems)));
      const [command, prefix] = getDlxCommand(packageManager, { isYarnClassic });
      await runCommand(command, [...prefix, SHADCN, "add", itemPath, "--yes"], { cwd });
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
    // shadcn writes its components in its own style, so only the ones it just added get the project's.
    if (missingUi.length > 0) {
      await formatFiles(packageManager, missingUi.map((name) => `${UI_DIR}/${name}.tsx`), cwd);
    }
  }

  await Promise.all(messages.writes.map(({ filePath, content }) => fs.writeFile(filePath, content)));
  if (messages.writes.length > 0) {
    await formatFiles(packageManager, messages.writes.map(({ filePath }) => filePath), cwd);
  }

  const generated = await refreshGenerated({
    cwd,
    packageManager,
    template,
    i18n,
    routes: files.writesPages,
    messages: messages.writes.length > 0,
  });

  return {
    alreadyInstalled: false,
    // The feature was there already, without its pages, and only they went in.
    pagesAdded: files.installed && files.writesPages,
    untranslated: messages.untranslated,
    entry: item.meta?.entry,
    // `{ path, file }` of the pages it put in, for the message after `add`: all of them on a fresh
    // install, only the missing ones it added to an installed module.
    pages: (item.meta?.pages ?? []).filter((page) =>
      files.installed ? files.writes.some(({ target }) => target === page.file) : files.writesPages
    ),
    ...skipped,
    ...generated,
  };
}

/** Takes out what `incoming` added. A text the project changed goes too, and is reported. */
export function removeMessages(current, incoming, prefix = "") {
  const kept = { ...current };
  const removed = [];
  const changed = [];
  for (const [key, value] of Object.entries(incoming)) {
    const name = `${prefix}${key}`;
    if (!(key in kept)) continue;
    if (isGroup(value) && isGroup(kept[key])) {
      const inner = removeMessages(kept[key], value, `${name}.`);
      removed.push(...inner.removed);
      changed.push(...inner.changed);
      kept[key] = inner.kept;
      if (Object.keys(inner.kept).length === 0) delete kept[key];
    } else {
      removed.push(name);
      if (!isDeepStrictEqual(kept[key], value)) changed.push(name);
      delete kept[key];
    }
  }
  return { kept, removed, changed };
}

async function planMessageRemoval(item, cwd) {
  const messages = item.meta?.messages;
  const dir = path.join(cwd, MESSAGES_DIR);
  if (!messages || !(await exists(dir))) return { writes: [], changed: [] };

  const writes = [];
  const changed = [];
  for (const file of (await fs.readdir(dir)).filter((name) => name.endsWith(".json"))) {
    const filePath = path.join(dir, file);
    const current = await readJson(filePath, `${MESSAGES_DIR}/${file}`);
    const incoming = messages[path.basename(file, ".json")] ?? messages.en;
    const result = removeMessages(current, incoming);
    if (result.removed.length === 0) continue;
    writes.push({ filePath, content: `${JSON.stringify(result.kept, null, 2)}\n` });
    changed.push(...result.changed.map((name) => `${MESSAGES_DIR}/${file}: ${name}`));
  }
  return { writes, changed };
}

/**
 * What `virastack remove` would delete, and which of it the project has changed. Writes nothing.
 * A page that differs from the module's goes in `changedPages`, apart from `files`: it may be the
 * project's own page after `add --no-pages`, or a module page the reader edited, so it is deleted
 * only on a yes. A symlink, or a path through one, is left alone (`symlinks`): it may lead to files
 * that are not the module's.
 */
export async function planRemoval(id, { cwd, template, i18n = false }) {
  const item = await loadItem(id, template, i18n);
  const root = await fs.realpath(cwd);
  const files = [];
  const changed = [];
  const changedPages = [];
  const symlinks = [];

  for (const { target, content } of item.files) {
    const filePath = path.resolve(cwd, target);
    if (!filePath.startsWith(`${path.resolve(cwd)}${path.sep}`)) {
      throw new Error(`${item.name} points outside the project: ${target}`);
    }
    const stat = await lstatOrNull(filePath);
    if (!stat) continue;
    if (stat.isSymbolicLink() || (await fs.realpath(filePath)) !== path.join(root, target)) {
      symlinks.push(target);
      continue;
    }
    if (!stat.isFile()) continue;
    const isChanged = !(await hasContent(filePath, content));
    if (isChanged && isRouteFile(target)) {
      changedPages.push(target);
      continue;
    }
    files.push(target);
    if (isChanged) changed.push(target);
  }

  const messages = await planMessageRemoval(item, cwd);
  return { files, messages: messages.writes, changed: [...changed, ...messages.changed], changedPages, symlinks };
}

/** Removes the folders the files leave empty, from the deepest up. */
async function removeEmptyFolders(files, cwd) {
  const folders = new Set();
  for (const file of files) {
    const parts = path.dirname(file).split(/[\\/]/);
    for (let depth = parts.length; depth > KEPT_FOLDER_DEPTH; depth -= 1) {
      const folder = parts.slice(0, depth).join("/");
      if (!KEPT_FOLDERS.has(folder)) folders.add(folder);
    }
  }
  const deepestFirst = [...folders].sort((a, b) => b.split("/").length - a.split("/").length);
  for (const folder of deepestFirst) {
    const folderPath = path.join(cwd, folder);
    const stat = await lstatOrNull(folderPath);
    // A symlinked folder is not the module's to delete, even when what it points at is empty.
    if (!stat?.isDirectory() || stat.isSymbolicLink()) continue;
    if ((await fs.readdir(folderPath)).length === 0) await fs.rmdir(folderPath);
  }
}

/**
 * Deletes what `planRemoval` found in `files`, plus the changed pages the reader said yes to.
 * Packages stay: other code in the project may use them. Returns `messages` and `routeTree`
 * warnings as `installFeature` does.
 */
export async function applyRemoval(plan, { cwd, packageManager, template, i18n = false }) {
  await Promise.all(plan.files.map((file) => fs.rm(path.join(cwd, file), { force: true })));
  await removeEmptyFolders(plan.files, cwd);

  await Promise.all(plan.messages.map(({ filePath, content }) => fs.writeFile(filePath, content)));
  if (plan.messages.length > 0) {
    await formatFiles(packageManager, plan.messages.map(({ filePath }) => filePath), cwd);
  }

  const routes = plan.files.some((file) => isRouteFile(file));
  return refreshGenerated({ cwd, packageManager, template, i18n, routes, messages: plan.messages.length > 0 });
}
