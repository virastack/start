import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";

import { runCommand } from "./exec.js";
import { getDlxCommand, getExecCommand } from "./package-manager.js";

const DEFAULT_REGISTRY = "https://virastack.com/r";
/** The version the registry was last tested with. Raised on purpose, never `latest`. */
export const SHADCN = "shadcn@4.23.0";
const MESSAGES_DIR = "src/messages";

const VALID_ID = /^[a-z0-9-]+$/;
const ITEM_SUFFIX = /-(nextjs|tanstack)(-i18n)?$/;
/** `src/features` and `src/app` are the project's own folders, even when they are empty. */
const KEPT_FOLDER_DEPTH = 2;

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
async function loadRegistryFile(file) {
  const base = getRegistryUrl();
  if (!/^https?:/.test(base)) {
    const filePath = path.join(base, file);
    if (!(await exists(filePath))) return null;
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  }

  let response;
  try {
    response = await fetch(`${base}/${file}`, { signal: AbortSignal.timeout(15_000) });
  } catch (error) {
    throw new RegistryUnavailableError(`Could not reach ${base}`, { cause: error });
  }
  if (response.status === 404) return null;
  if (!response.ok) throw new RegistryUnavailableError(`${base} answered ${response.status}`);
  return response.json();
}

/** The modules the registry offers now. Empty when it cannot be reached. */
export async function listFeatures() {
  try {
    const registry = await loadRegistryFile("registry.json");
    const ids = (registry?.items ?? []).map((item) => item.name.replace(ITEM_SUFFIX, ""));
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

/** A feature that cannot be installed without touching what the project already has. */
export class FeatureConflictError extends Error {
  constructor(conflicts) {
    super(conflicts.join(", "));
    this.name = "FeatureConflictError";
    this.conflicts = conflicts;
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

/** All or nothing: only a part of the files means the project has its own code there. */
async function planFiles(item, cwd) {
  const checks = await Promise.all(item.files.map((file) => exists(path.join(cwd, file.target))));
  const existing = item.files.filter((_, index) => checks[index]).map((file) => file.target);
  const isPartial = existing.length > 0 && existing.length < item.files.length;
  return { installed: existing.length === item.files.length, conflicts: isPartial ? existing : [] };
}

async function readJson(filePath, name) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${name} could not be read: ${error.message}`, { cause: error });
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

/** Paraglide compiles the messages; the router has to see the changed routes. */
async function refreshGenerated({ cwd, packageManager, template, i18n }) {
  if (template !== "tanstack") return;
  if (i18n) await runCommand(packageManager, ["run", "postinstall"], { cwd });
  await runCommand(packageManager, ["run", "generate-routes"], { cwd });
}

/**
 * Installs a feature with shadcn and merges its messages. Checks everything first, so a conflict
 * changes nothing. Throws FeatureConflictError for one.
 */
export async function installFeature(id, { cwd, packageManager, template, i18n = false, isYarnClassic }) {
  const item = await loadItem(id, template, i18n);

  const required = item.meta?.minStartVersion;
  if (required) {
    const { version } = await readProjectInfo(cwd);
    if (isOlderVersion(version, required)) throw new StartTooOldError(required, version ?? "?");
  }

  const files = await planFiles(item, cwd);
  const messages = await planMessages(item, cwd);

  const conflicts = [...files.conflicts, ...messages.conflicts];
  if (conflicts.length > 0) throw new FeatureConflictError(conflicts);
  if (files.installed && messages.writes.length === 0) return { alreadyInstalled: true, untranslated: [] };

  if (!files.installed) {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "virastack-add-"));
    const itemPath = path.join(dir, `${item.name}.json`);
    try {
      await fs.writeFile(itemPath, JSON.stringify(item));
      const [command, prefix] = getDlxCommand(packageManager, { isYarnClassic });
      await runCommand(command, [...prefix, SHADCN, "add", itemPath, "--yes"], { cwd });
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  }

  await Promise.all(messages.writes.map(({ filePath, content }) => fs.writeFile(filePath, content)));
  if (messages.writes.length > 0) {
    await formatFiles(packageManager, messages.writes.map(({ filePath }) => filePath), cwd);
  }

  await refreshGenerated({ cwd, packageManager, template, i18n });

  return { alreadyInstalled: false, untranslated: messages.untranslated, pagePath: item.meta?.pagePath };
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

/** shadcn drops `.js` from `@/` imports while installing, so that alone is not a change. */
function toComparable(source) {
  return source.replace(/\r\n/g, "\n").replace(/(from "@\/[^"]+)\.js"/g, '$1"');
}

/** What `virastack remove` would delete, and which of it the project has changed. Writes nothing. */
export async function planRemoval(id, { cwd, template, i18n = false }) {
  const item = await loadItem(id, template, i18n);
  const files = [];
  const changed = [];

  for (const { target, content } of item.files) {
    const filePath = path.resolve(cwd, target);
    if (!filePath.startsWith(`${path.resolve(cwd)}${path.sep}`)) {
      throw new Error(`${item.name} points outside the project: ${target}`);
    }
    if (!(await exists(filePath))) continue;
    files.push(target);
    if (toComparable(await fs.readFile(filePath, "utf8")) !== toComparable(content)) changed.push(target);
  }

  const messages = await planMessageRemoval(item, cwd);
  return { files, messages: messages.writes, changed: [...changed, ...messages.changed] };
}

/** Removes the folders the files leave empty, from the deepest up. */
async function removeEmptyFolders(files, cwd) {
  const folders = new Set();
  for (const file of files) {
    const parts = path.dirname(file).split(/[\\/]/);
    for (let depth = parts.length; depth > KEPT_FOLDER_DEPTH; depth -= 1) {
      folders.add(parts.slice(0, depth).join("/"));
    }
  }
  const deepestFirst = [...folders].sort((a, b) => b.split("/").length - a.split("/").length);
  for (const folder of deepestFirst) {
    const folderPath = path.join(cwd, folder);
    if ((await exists(folderPath)) && (await fs.readdir(folderPath)).length === 0) await fs.rmdir(folderPath);
  }
}

/** Deletes what `planRemoval` found. Packages stay: other code in the project may use them. */
export async function applyRemoval(plan, { cwd, packageManager, template, i18n = false }) {
  await Promise.all(plan.files.map((file) => fs.rm(path.join(cwd, file), { force: true })));
  await removeEmptyFolders(plan.files, cwd);

  await Promise.all(plan.messages.map(({ filePath, content }) => fs.writeFile(filePath, content)));
  if (plan.messages.length > 0) {
    await formatFiles(packageManager, plan.messages.map(({ filePath }) => filePath), cwd);
  }

  await refreshGenerated({ cwd, packageManager, template, i18n });
}
