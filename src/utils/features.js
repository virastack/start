import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { runCommand } from "./exec.js";
import { getDlxCommand } from "./package-manager.js";

const DEFAULT_REGISTRY = "https://virastack.com/r/v2";
/** The version the registry was last tested with. Raised on purpose, never `latest`. */
const SHADCN = "shadcn@4.23.0";
const HOME_CONSTANTS = "src/features/home/constants/home.constants.ts";
const DEMO_LINE = /export const DEMO_PATH = .* as string \| null/;

/** Installed through `virastack add <id>`. Names share one namespace with tools. */
export const FEATURES = [{ id: "users", demoPath: "/users" }];

export function findFeature(id) {
  return FEATURES.find((feature) => feature.id === id);
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
  return { template: pkg.virastack?.template, i18n: pkg.virastack?.i18n === true };
}

async function loadItem(feature, framework) {
  const base = getRegistryUrl();
  const name = `${feature.id}-${framework}.json`;
  if (!/^https?:/.test(base)) return JSON.parse(await fs.readFile(path.join(base, name), "utf8"));

  const response = await fetch(`${base}/${name}`, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`Registry answered ${response.status} for ${name}`);
  return response.json();
}

/** Removes what already exists, so `add` never overwrites a route the project owns. */
export async function withoutExistingFiles(item, cwd) {
  const checks = await Promise.all(item.files.map((file) => exists(path.join(cwd, file.target))));
  return {
    item: { ...item, files: item.files.filter((_, index) => !checks[index]) },
    skipped: item.files.filter((_, index) => checks[index]).map((file) => file.target),
  };
}

/** Shows or hides the start page links to the demo. */
export async function setDemoPath(cwd, demoPath) {
  const file = path.join(cwd, HOME_CONSTANTS);
  if (!(await exists(file))) return;

  const source = await fs.readFile(file, "utf8");
  const value = demoPath ? JSON.stringify(demoPath) : "null";
  await fs.writeFile(file, source.replace(DEMO_LINE, `export const DEMO_PATH = ${value} as string | null`));
}

/** Installs a feature with shadcn and returns the files it left alone. */
export async function installFeature(feature, { cwd, packageManager, template, isYarnClassic }) {
  const loaded = await loadItem(feature, template);
  const { item, skipped } = await withoutExistingFiles(loaded, cwd);

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "virastack-add-"));
  const itemPath = path.join(dir, `${item.name}.json`);
  try {
    await fs.writeFile(itemPath, JSON.stringify(item));
    const [command, prefix] = getDlxCommand(packageManager, { isYarnClassic });
    await runCommand(command, [...prefix, SHADCN, "add", itemPath, "--yes"], { cwd });
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }

  if (template === "tanstack") {
    await runCommand(packageManager, ["run", "generate-routes"], { cwd });
  }
  if (feature.demoPath) await setDemoPath(cwd, feature.demoPath);

  return { skipped };
}
