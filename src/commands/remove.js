import path from "node:path";
import { promises as fs } from "node:fs";
import * as p from "@clack/prompts";

import { t } from "../i18n.js";
import { detectPackageManager } from "../utils/package-manager.js";
import { trackEvent } from "../utils/telemetry.js";
import { accent, intro, logError, spinner as createSpinner } from "../utils/ui.js";
import {
  applyRemoval,
  FeatureNotFoundError,
  listFeatures,
  planRemoval,
  readProjectInfo,
  RegistryUnavailableError,
} from "../utils/features.js";

async function formatAvailable(message) {
  const features = await listFeatures();
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
 * @param {string | undefined} id
 * @param {{ yes?: boolean }} [options]
 */
export async function runRemove(id, { yes = false } = {}) {
  console.log();
  intro();

  if (!id) {
    p.log.error(await formatAvailable(t("remove.missing")));
    process.exit(1);
  }

  const cwd = process.cwd();
  try {
    await fs.access(path.join(cwd, "package.json"));
  } catch {
    p.log.error(t("add.notAProject"));
    process.exit(1);
  }

  const { template, i18n } = await readProjectInfo(cwd);
  if (!template) {
    p.log.error(t("add.notStart"));
    process.exit(1);
  }

  let plan;
  try {
    plan = await planRemoval(id, { cwd, template, i18n });
  } catch (error) {
    if (error instanceof FeatureNotFoundError) {
      p.log.error(await formatAvailable(t("add.toolInvalid", { tool: accent(id) })));
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
  if (plan.changed.length > 0) await confirmChanged(id, plan.changed, yes);

  const packageManager = detectPackageManager();
  const spinner = createSpinner();
  spinner.start(t("remove.removing", { pkg: accent(id) }));
  try {
    await applyRemoval(plan, { cwd, packageManager, template, i18n });
    spinner.stop(t("remove.done", { pkg: accent(id) }));
    p.log.info(t("remove.packagesKept"));
  } catch (error) {
    spinner.error(t("remove.failed", { pkg: accent(id) }));
    logError(error);
    process.exit(1);
  }

  await trackEvent("remove", { feature: id, packageManager });
}
