import path from "node:path";
import { promises as fs } from "node:fs";
import * as p from "@clack/prompts";

import { t } from "../i18n.js";
import { detectPackageManager } from "../utils/package-manager.js";
import { trackEvent } from "../utils/telemetry.js";
import { accent, intro, logError, spinner as createSpinner, warnGenerated } from "../utils/ui.js";
import {
  applyRemoval,
  FeatureNotFoundError,
  listFeatures,
  planRemoval,
  readProjectInfo,
  RegistryUnavailableError,
} from "../utils/features.js";

/** The modules of this project's template, as `add` lists them. */
async function formatAvailable(message, { template, i18n }) {
  const features = await listFeatures({ template, i18n });
  return features.length > 0 ? `${message}\n  ${t("add.modules")}: ${features.join(", ")}` : message;
}

/** A change of the user's goes only with their yes. A script has to say so with `--yes`. */
async function confirmChanged(id, changed, yes) {
  p.log.warn(t("remove.changedList", { list: changed.join("\n  ") }));
  if (yes) return;

  if (!process.stdin.isTTY) {
    p.log.error(t("remove.needsYes"));
    process.exit(1);
  }
  const confirmed = await p.confirm({ message: t("remove.confirm"), initialValue: false });
  if (p.isCancel(confirmed) || !confirmed) {
    p.outro(t("remove.kept", { pkg: accent(id) }));
    process.exit(0);
  }
}

/**
 * A page that differs from the module's may be the reader's own (after `add --no-pages`) or one
 * they edited, so it goes only on an explicit yes; a script, which cannot be asked, keeps it.
 * Returns the pages to delete.
 */
async function confirmChangedPages(changedPages, yes) {
  if (changedPages.length === 0) return [];
  const list = changedPages.join("\n  ");
  if (yes || !process.stdin.isTTY) {
    p.log.warn(t("remove.pagesKept", { list }));
    return [];
  }
  p.log.warn(t("remove.changedPages", { list }));
  const confirmed = await p.confirm({ message: t("remove.confirmPages"), initialValue: false });
  if (p.isCancel(confirmed) || !confirmed) {
    p.log.info(t("remove.pagesStay"));
    return [];
  }
  return changedPages;
}

/**
 * @param {string | undefined} id
 * @param {{ yes?: boolean }} [options]
 */
export async function runRemove(id, { yes = false } = {}) {
  console.log();
  intro();

  const cwd = process.cwd();
  const project = await readProjectInfo(cwd).catch(() => ({ template: undefined, i18n: false }));
  if (!id) {
    p.log.error(await formatAvailable(t("remove.missing"), project));
    process.exit(1);
  }

  try {
    await fs.access(path.join(cwd, "package.json"));
  } catch {
    p.log.error(t("add.notAProject"));
    process.exit(1);
  }

  const { template, i18n } = project;
  if (!template) {
    p.log.error(t("add.notStart"));
    process.exit(1);
  }

  let plan;
  try {
    plan = await planRemoval(id, { cwd, template, i18n });
  } catch (error) {
    if (error instanceof FeatureNotFoundError) {
      p.log.error(await formatAvailable(t("add.toolInvalid", { tool: accent(id) }), project));
    } else if (error instanceof RegistryUnavailableError) {
      p.log.error(t("add.registryUnavailable"));
    } else {
      logError(error);
    }
    process.exit(1);
  }

  if (plan.files.length === 0 && plan.messages.length === 0) {
    p.log.info(t("remove.notInstalled", { pkg: accent(id) }));
    return;
  }
  if (plan.symlinks.length > 0) p.log.warn(t("remove.symlinks", { list: plan.symlinks.join("\n  ") }));
  if (plan.changed.length > 0) await confirmChanged(id, plan.changed, yes);
  // Asked before anything is deleted, so the reader sees the whole plan first.
  const pages = await confirmChangedPages(plan.changedPages, yes);

  const packageManager = detectPackageManager();
  const spinner = createSpinner();
  spinner.start(t("remove.removing", { pkg: accent(id) }));
  try {
    const generated = await applyRemoval(
      { ...plan, files: [...plan.files, ...pages] },
      { cwd, packageManager, template, i18n },
    );
    spinner.stop(t("remove.done", { pkg: accent(id) }));
    warnGenerated(generated);
    p.log.info(t("remove.packagesKept"));
  } catch (error) {
    spinner.error(t("remove.failed", { pkg: accent(id) }));
    logError(error);
    process.exit(1);
  }

  await trackEvent("remove", { feature: id, packageManager });
}
