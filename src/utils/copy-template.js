import { promises as fs } from "node:fs";
import path from "node:path";

// Lockfiles are excluded on purpose: we run a fresh install with whichever
// package manager the user invoked the CLI with, and a stale lockfile from
// the template (always pnpm) would otherwise conflict with npm/yarn/bun.
const IGNORED_ENTRIES = new Set([
  ".git",
  "node_modules",
  ".next",
  "out",
  "dist",
  "build",
  "coverage",
  ".vercel",
  ".turbo",
  ".eslintcache",
  ".knip",
  ".DS_Store",
  "Thumbs.db",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  ".gitkeep",
  "assets",
]);

export function shouldIgnore(name) {
  if (IGNORED_ENTRIES.has(name)) return true;
  // Keep .env.example; skip local/secret env files and editor dumps.
  if (name.startsWith(".env") && name !== ".env.example") return true;
  if (name.endsWith(".tsbuildinfo")) return true;
  if (name.endsWith(".log")) return true;
  return false;
}

export async function copyTemplate(srcDir, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    if (shouldIgnore(entry.name)) continue;

    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      await copyTemplate(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

export async function dirHasFiles(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.some((entry) => entry !== ".gitkeep");
  } catch {
    return false;
  }
}

export async function isDirEmpty(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length === 0;
  } catch {
    // Directory doesn't exist yet — treat as empty, we'll create it.
    return true;
  }
}
