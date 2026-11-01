/**
 * Keeps the files the four templates share identical, so a shared change is made once.
 *
 *   node scripts/sync-templates.js           report drift, exit 1 when there is any
 *   node scripts/sync-templates.js --write   apply it: copy from the source, remove extras
 *
 * `templates-shared` is the source of what all four templates share. Framework pairs still copy
 * from their base template. Feature files are listed one by one, because a feature differs per
 * framework: a whole feature folder is refused. The users demo lives in `registry/users`.
 * This script never ships in the npm package and never runs on a user's machine.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SHARED = "templates-shared";
const NEXT = "templates/nextjs";
const TANSTACK = "templates/tanstack";
const NEXT_I18N = "templates-i18n/nextjs";
const TANSTACK_I18N = "templates-i18n/tanstack";

export const TEMPLATES = [NEXT, TANSTACK, NEXT_I18N, TANSTACK_I18N];

const SKIPPED_NAMES = new Set(["node_modules", ".next", "dist", ".output", ".DS_Store"]);

/** An entry ending in `/` is a whole folder; extra files in a target folder count as drift. */
export const GROUPS = [
  {
    name: "all templates",
    source: SHARED,
    targets: TEMPLATES,
    entries: [
      ".github/workflows/ci.yml",
      ".husky/commit-msg",
      ".husky/pre-commit",
      ".husky/pre-push",
      ".prettierrc",
      ".vscode/extensions.json",
      "LICENSE",
      "commitlint.config.js",
      "public/favicon.ico",
      "public/logo.png",
      "public/logo.webp",
      "public/og.png",
      "src/components/ui/",
      "src/constants/.gitkeep",
      "src/features/home/helpers/parse-version.test.ts",
      "src/features/home/helpers/parse-version.ts",
      "src/features/home/icons/react-hook-form.tsx",
      "src/features/home/icons/react.tsx",
      "src/features/home/icons/shadcn.tsx",
      "src/features/home/icons/tailwind.tsx",
      "src/features/home/icons/tanstack.tsx",
      "src/features/home/icons/typescript.tsx",
      "src/features/home/icons/zod.tsx",
      "src/features/home/icons/zustand.tsx",
      "src/helpers/.gitkeep",
      "src/hooks/.gitkeep",
      "src/lib/",
      "src/schemas/.gitkeep",
      "src/stores/.gitkeep",
      "src/test/server.ts",
      "src/test/setup.ts",
      "src/types/site-config.types.ts",
      "vitest.config.ts"
    ],
  },
  {
    name: "Next.js",
    source: NEXT,
    targets: [NEXT_I18N],
    entries: [
      ".env.example",
      ".prettierignore",
      ".vscode/settings.json",
      "_gitignore",
      "components.json",
      "eslint.config.mjs",
      "pnpm-workspace.yaml",
      "postcss.config.mjs",
      "src/app/favicon.ico",
      "src/app/global-error.tsx",
      "src/app/manifest.ts",
      "src/app/robots.ts",
      "src/config/site.config.ts",
      "src/env.ts",
      "src/providers/",
      "src/styles/tailwind.css",
      "tsconfig.json",
    ],
  },
  {
    name: "TanStack Start",
    source: TANSTACK,
    targets: [TANSTACK_I18N],
    entries: [
      ".env.example",
      ".vscode/settings.json",
      "components.json",
      "pnpm-workspace.yaml",
      "src/components/shared/Pending.tsx",
      "src/config/site.config.ts",
      "src/env.ts",
      "src/providers/",
      "src/router.tsx",
      "src/routes/robots[.]txt.ts",
      "src/routes/site[.]webmanifest.ts",
      "src/start.ts",
      "src/styles/tailwind.css",
      "tsr.config.json",
    ],
  },
];

function assertEntry(entry) {
  const normalized = path.posix.normalize(entry);
  if (path.posix.isAbsolute(entry) || normalized.startsWith("..")) {
    throw new Error(`Entry leaves the template: ${entry}`);
  }
  if (normalized.startsWith("src/features") && entry.endsWith("/")) {
    throw new Error(`List feature files one by one: ${entry}`);
  }
}

function listFiles(root, dir) {
  const full = path.join(root, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full, { withFileTypes: true }).flatMap((item) => {
    if (SKIPPED_NAMES.has(item.name)) return [];
    const rel = path.posix.join(dir, item.name);
    return item.isDirectory() ? listFiles(root, rel) : [rel];
  });
}

function entryFiles(root, template, entry) {
  const prefix = path.posix.join(template, "");
  return listFiles(root, path.posix.join(template, entry)).map((file) => file.slice(prefix.length));
}

const sameBytes = (a, b) => a.equals(b);

/** Lists what differs without writing anything. Paths are relative to `root`. */
export function planFiles(root, groups = GROUPS) {
  const copies = [];
  const removals = [];

  for (const { source, targets, entries } of groups) {
    for (const entry of entries) {
      assertEntry(entry);
      const isFolder = entry.endsWith("/");
      const files = isFolder ? entryFiles(root, source, entry) : [entry];

      for (const file of files) {
        const from = path.posix.join(source, file);
        if (!existsSync(path.join(root, from))) {
          throw new Error(`Source file is missing: ${from}`);
        }
      }

      for (const target of targets) {
        for (const file of files) {
          const from = path.posix.join(source, file);
          const to = path.posix.join(target, file);
          const current = path.join(root, to);
          const same =
            existsSync(current) &&
            sameBytes(readFileSync(path.join(root, from)), readFileSync(current));
          if (!same) copies.push({ from, to });
        }
        if (isFolder) {
          for (const file of entryFiles(root, target, entry)) {
            if (!files.includes(file)) removals.push(path.posix.join(target, file));
          }
        }
      }
    }
  }

  return { copies, removals };
}

const DEPENDENCY_FIELDS = ["dependencies", "devDependencies"];

const readPackage = (root, template) =>
  JSON.parse(readFileSync(path.join(root, template, "package.json"), "utf8"));

/** A package used by several templates has one version: the first template that lists it decides. */
export function planDependencies(root, templates = TEMPLATES) {
  const packages = templates.map((template) => ({ template, pkg: readPackage(root, template) }));
  const versions = new Map();
  const changes = [];

  for (const { template, pkg } of packages) {
    for (const field of DEPENDENCY_FIELDS) {
      for (const [name, version] of Object.entries(pkg[field] ?? {})) {
        if (!versions.has(name)) versions.set(name, version);
        const expected = versions.get(name);
        if (version !== expected) changes.push({ template, field, name, version, expected });
      }
    }
  }

  return changes;
}

export function applyPlan(root, { copies, removals }, dependencies) {
  for (const { from, to } of copies) {
    mkdirSync(path.dirname(path.join(root, to)), { recursive: true });
    writeFileSync(path.join(root, to), readFileSync(path.join(root, from)));
  }
  for (const file of removals) {
    rmSync(path.join(root, file));
  }
  for (const template of new Set(dependencies.map((change) => change.template))) {
    const pkg = readPackage(root, template);
    for (const change of dependencies.filter((item) => item.template === template)) {
      pkg[change.field][change.name] = change.expected;
    }
    writeFileSync(path.join(root, template, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
  }
}

function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const write = process.argv.includes("--write");
  const plan = planFiles(root);
  const dependencies = planDependencies(root);
  const total = plan.copies.length + plan.removals.length + dependencies.length;

  for (const { from, to } of plan.copies) console.log(`differs   ${to}  (source: ${from})`);
  for (const file of plan.removals) console.log(`extra     ${file}`);
  for (const { template, name, version, expected } of dependencies) {
    console.log(`version   ${template}: ${name} ${version}, expected ${expected}`);
  }

  if (total === 0) {
    console.log("Templates are in sync.");
    return;
  }
  if (!write) {
    console.error(`\n${total} difference(s). Run: npm run sync:templates`);
    process.exitCode = 1;
    return;
  }

  // Git is the undo for what this overwrites, so unsaved work stops the run.
  const touched = [...plan.copies.map(({ to }) => to), ...plan.removals];
  const dirty =
    touched.length > 0
      ? execFileSync("git", ["status", "--porcelain", "--", ...touched], {
          cwd: root,
          encoding: "utf8",
        })
      : "";
  if (dirty) {
    console.error("Commit these first:\n" + dirty);
    process.exitCode = 1;
    return;
  }

  applyPlan(root, plan, dependencies);
  console.log(`\nApplied ${total} change(s).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
