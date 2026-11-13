import path from "node:path";
import { promises as fs } from "node:fs";
import * as p from "@clack/prompts";

import { t, getLocale } from "../i18n.js";
import { runCommand } from "../utils/exec.js";
import { detectPackageManager, getAddArgs } from "../utils/package-manager.js";
import { trackEvent } from "../utils/telemetry.js";
import { accent, intro, logError, spinner as createSpinner, warnGenerated } from "../utils/ui.js";
import { findTool, TOOLS } from "../utils/tools.js";
import { getAiInitArgs } from "../utils/agents.js";
import {
  FEATURES_URL,
  FeatureConflictError,
  FeatureNotFoundError,
  installFeature,
  listFeatures,
  readProjectInfo,
  RegistryUnavailableError,
  StartTooOldError,
} from "../utils/features.js";

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** The project's template, when the command runs inside a Start project. */
async function readTemplate(cwd) {
  try {
    return await readProjectInfo(cwd);
  } catch {
    return {};
  }
}

/** Tools come first, because the list of modules keeps growing. Modules are the project's template's. */
async function formatAvailable(message) {
  const { template, i18n } = await readTemplate(process.cwd());
  const features = await listFeatures({ template, i18n });
  const lines = [message, `  ${t("add.tools")}: ${TOOLS.map(({ id }) => id).join(", ")}`];
  if (features.length > 0) lines.push(`  ${t("add.modules")}: ${features.join(", ")}`);
  return lines.join("\n");
}

/** `/products  src/app/products/page.tsx`, one page per line, the paths lined up. */
function formatPages(pages) {
  const width = Math.max(...pages.map((page) => page.path.length));
  return pages.map((page) => `${accent(page.path.padEnd(width))}  ${page.file}`).join("\n  ");
}

/**
 * @param {string} id
 * @param {{ pages?: boolean }} [options] `pages: false` leaves the module's pages out.
 */
async function addFeature(id, { pages: withPages = true } = {}) {
  const cwd = process.cwd();
  if (!(await fileExists(path.join(cwd, "package.json")))) {
    p.log.error(t("add.notAProject"));
    process.exit(1);
  }

  const { template, i18n } = await readProjectInfo(cwd);
  if (!template) {
    p.log.error(t("add.notStart"));
    process.exit(1);
  }

  const packageManager = detectPackageManager();
  const spinner = createSpinner();
  spinner.start(t("add.installing", { pkg: accent(id) }));
  try {
    const { alreadyInstalled, pagesAdded, untranslated, entry, pages = [], skippedPages = [], ...generated } = await installFeature(id, {
      cwd,
      packageManager,
      template,
      i18n,
      isYarnClassic: (process.env.npm_config_user_agent ?? "").startsWith("yarn/1."),
      pages: withPages,
    });
    const done = alreadyInstalled ? "add.alreadyInstalled" : pagesAdded ? "add.pagesAdded" : "add.done";
    spinner.stop(t(done, { pkg: accent(id) }));
    warnGenerated(generated);
    if (skippedPages.length > 0) {
      const list = skippedPages.map(({ file, routes }) => `${file} ← ${routes.join(", ")}`).join("\n  ");
      p.log.info(t("add.pagesSkipped", { list }));
    }
    // A module with its pages is ready to open; without them, it goes on a page of the reader's.
    if (pages.length > 0) {
      p.log.info(t("add.pages", { list: formatPages(pages) }));
    } else if (entry) {
      p.log.info(
        t("add.useInPage", {
          code: accent(`import { ${entry.name} } from "${entry.file}"`),
          url: `${FEATURES_URL}/${id}`,
        }),
      );
    }
    if (untranslated.length > 0) {
      p.log.warn(t("add.untranslated", { locales: untranslated.join(", ") }));
    }
  } catch (error) {
    if (error instanceof FeatureNotFoundError) {
      spinner.error(t("add.installFailed", { pkg: accent(id) }));
      p.log.error(await formatAvailable(t("add.toolInvalid", { tool: accent(id) })));
      process.exit(1);
    }
    if (error instanceof StartTooOldError) {
      spinner.error(t("add.installFailed", { pkg: accent(id) }));
      p.log.error(t("add.startTooOld", { pkg: accent(id), required: error.required, current: error.current }));
      process.exit(1);
    }
    if (error instanceof RegistryUnavailableError) {
      spinner.error(t("add.installFailed", { pkg: accent(id) }));
      p.log.error(t("add.registryUnavailable"));
      process.exit(1);
    }
    if (error instanceof FeatureConflictError) {
      spinner.error(t("add.conflict", { pkg: accent(id) }));
      if (error.conflicts.length > 0) p.log.warn(t("add.conflictList", { list: error.conflicts.join("\n  ") }));
      if (error.routes.length > 0) p.log.warn(t("add.conflictRoutes", { list: error.routes.join("\n  ") }));
      if (error.links.length > 0) p.log.warn(t("add.conflictLinks", { list: error.links.join("\n  ") }));
      if (error.pages) p.log.info(t("add.conflictNoPages", { flag: accent("--no-pages") }));
      process.exit(1);
    }
    spinner.error(t("add.installFailed", { pkg: accent(id) }));
    logError(error);
    process.exit(1);
  }

  await trackEvent("add", { feature: id, packageManager });
}

/**
 * @param {string | undefined} toolId
 * @param {{ agents?: string[], pages?: boolean }} [options] `agents` applies to `add ai` only,
 *   `pages: false` (`--no-pages`) to modules only.
 */
export async function runAdd(toolId, options = {}) {
  console.log();
  intro();

  if (!toolId) {
    p.log.error(await formatAvailable(t("add.toolMissing")));
    process.exit(1);
  }

  const tool = findTool(toolId);
  if (!tool) {
    await addFeature(toolId, { pages: options.pages });
    return;
  }

  const cwd = process.cwd();
  if (!(await fileExists(path.join(cwd, "package.json")))) {
    p.log.error(t("add.notAProject"));
    process.exit(1);
  }

  const packageManager = detectPackageManager();
  const spinner = createSpinner();
  spinner.start(t("add.installing", { pkg: accent(tool.package) }));

  try {
    if (tool.kind === "dependency") {
      await runCommand(packageManager, getAddArgs(packageManager, [tool.package]), { cwd });
    } else {
      await runCommand("npx", getAiInitArgs(options.agents, { tr: getLocale() === "tr" }), { cwd });
    }
    spinner.stop(t("add.done", { pkg: accent(tool.package) }));
  } catch (error) {
    spinner.error(t("add.installFailed", { pkg: accent(tool.package) }));
    logError(error);
    process.exit(1);
  }

  await trackEvent("add", {
    tool: tool.id,
    ...(tool.id === "ai" && options.agents ? { agents: options.agents } : {}),
    packageManager,
  });
}
