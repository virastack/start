import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { runCommand } from "./exec.js";
import { getDlxCommand, getExecCommand } from "./package-manager.js";

const DEFAULT_REGISTRY = "https://virastack.com/r";
/** The version the registry was last tested with. Raised on purpose, never `latest`. */
export const SHADCN = "shadcn@4.23.0";
const MESSAGES_DIR = "src/messages";
const HOME_CONSTANTS = "src/features/home/constants/home.constants.ts";
const DEMO_LINE = /export const DEMO_PATH = .* as string \| null/;

const VALID_ID = /^[a-z0-9-]+$/;
const ITEM_SUFFIX = /-(nextjs|tanstack)(-i18n)?$/;

/** The module `init` installs as the project's demo. */
export const DEMO_FEATURE = "users";

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
  constructor(conflicts, demoPath) {
    super(conflicts.join(", "));
    this.name = "FeatureConflictError";
    this.conflicts = conflicts;
    this.demoPath = demoPath;
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

/** Shows or hides the start page links to the demo. */
export async function setDemoPath(cwd, demoPath) {
  const file = path.join(cwd, HOME_CONSTANTS);
  if (!(await exists(file))) return;

  const source = await fs.readFile(file, "utf8");
  const value = demoPath ? JSON.stringify(demoPath) : "null";
  await fs.writeFile(file, source.replace(DEMO_LINE, `export const DEMO_PATH = ${value} as string | null`));
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

/**
 * Installs a feature with shadcn and merges its messages. Checks everything first, so a conflict
 * changes nothing. Throws FeatureConflictError for one.
 */
export async function installFeature(id, { cwd, packageManager, template, i18n = false, isYarnClassic }) {
  const item = VALID_ID.test(id)
    ? await loadRegistryFile(`${id}-${template}${i18n ? "-i18n" : ""}.json`)
    : null;
  if (!item) throw new FeatureNotFoundError(id);

  const required = item.meta?.minStartVersion;
  if (required) {
    const { version } = await readProjectInfo(cwd);
    if (isOlderVersion(version, required)) throw new StartTooOldError(required, version ?? "?");
  }

  const demoPath = item.meta?.demoPath;

  const files = await planFiles(item, cwd);
  const messages = await planMessages(item, cwd);

  const conflicts = [...files.conflicts, ...messages.conflicts];
  if (conflicts.length > 0) throw new FeatureConflictError(conflicts, demoPath);
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

  if (template === "tanstack") {
    // Paraglide compiles the messages; the router has to see the new route.
    if (i18n) await runCommand(packageManager, ["run", "postinstall"], { cwd });
    await runCommand(packageManager, ["run", "generate-routes"], { cwd });
  }
  if (demoPath) await setDemoPath(cwd, demoPath);

  return { alreadyInstalled: false, untranslated: messages.untranslated };
}
