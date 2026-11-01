import path from "node:path";
import { promises as fs } from "node:fs";
import * as p from "@clack/prompts";
import pc from "picocolors";

import { t } from "../i18n.js";
import { detectPackageManager } from "../utils/package-manager.js";
import { trackEvent } from "../utils/telemetry.js";
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
    p.outro(t("remove.kept", { pkg: id }));
    process.exit(0);
  }
}

/**
 * @param {string | undefined} id
 * @param {{ yes?: boolean }} [options]
 */
export async function runRemove(id, { yes = false } = {}) {
  console.log();
  p.intro(pc.bgMagenta(pc.black(" ViraStack ")));

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
      p.log.error(await formatAvailable(t("add.toolInvalid", { tool: id })));
    } else if (error instanceof RegistryUnavailableError) {
      p.log.error(t("add.registryUnavailable"));
    } else {
      p.log.error(String(error?.message ?? error));
    }
    process.exit(1);
  }

  if (plan.files.length === 0 && plan.messages.length === 0) {
    p.log.info(t("remove.notInstalled", { pkg: id }));
    return;
  }
  if (plan.changed.length > 0) await confirmChanged(id, plan.changed, yes);

  const packageManager = detectPackageManager();
  const spinner = p.spinner();
  spinner.start(t("remove.removing", { pkg: id }));
  try {
    await applyRemoval(plan, { cwd, packageManager, template, i18n });
    spinner.stop(t("remove.done", { pkg: id }));
    p.log.info(t("remove.packagesKept"));
  } catch (error) {
    spinner.stop(t("remove.failed", { pkg: id }));
    p.log.error(String(error?.message ?? error));
    process.exit(1);
  }

  await trackEvent("remove", { feature: id, packageManager });
}
