import path from "node:path";
import { promises as fs } from "node:fs";
import * as p from "@clack/prompts";
import pc from "picocolors";

import { t, getLocale } from "../i18n.js";
import { runCommand } from "../utils/exec.js";
import { detectPackageManager, getAddArgs } from "../utils/package-manager.js";
import { trackEvent } from "../utils/telemetry.js";
import { findTool, TOOLS } from "../utils/tools.js";
import { getAiInitArgs } from "../utils/agents.js";
import { FeatureConflictError, findFeature, installFeature, readProjectInfo } from "../utils/features.js";

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function addFeature(feature) {
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
  const spinner = p.spinner();
  spinner.start(t("add.installing", { pkg: feature.id }));
  try {
    const { alreadyInstalled, untranslated } = await installFeature(feature, {
      cwd,
      packageManager,
      template,
      i18n,
      isYarnClassic: (process.env.npm_config_user_agent ?? "").startsWith("yarn/1."),
    });
    spinner.stop(t(alreadyInstalled ? "add.alreadyInstalled" : "add.done", { pkg: feature.id }));
    if (untranslated.length > 0) {
      p.log.warn(t("add.untranslated", { locales: untranslated.join(", ") }));
    }
  } catch (error) {
    if (error instanceof FeatureConflictError) {
      spinner.stop(t("add.conflict", { pkg: feature.id }));
      p.log.warn(t("add.conflictList", { list: error.conflicts.join("\n  ") }));
      if (feature.demoPath) p.log.info(t("add.conflictDemo"));
      process.exit(1);
    }
    spinner.stop(t("add.installFailed", { pkg: feature.id }));
    p.log.error(String(error?.message ?? error));
    process.exit(1);
  }

  await trackEvent("add", { feature: feature.id, packageManager });
}

/**
 * @param {string | undefined} toolId
 * @param {{ agents?: string[] }} [options] `agents` applies to `add ai` only.
 */
export async function runAdd(toolId, options = {}) {
  console.log();
  p.intro(pc.bgMagenta(pc.black(" ViraStack ")));

  const toolList = TOOLS.map((tool) => tool.id).join(", ");

  if (!toolId) {
    p.log.error(t("add.toolMissing", { list: toolList }));
    process.exit(1);
  }

  const feature = findFeature(toolId);
  if (feature) {
    await addFeature(feature);
    return;
  }

  const tool = findTool(toolId);
  if (!tool) {
    p.log.error(t("add.toolInvalid", { tool: toolId, list: toolList }));
    process.exit(1);
  }

  const cwd = process.cwd();
  if (!(await fileExists(path.join(cwd, "package.json")))) {
    p.log.error(t("add.notAProject"));
    process.exit(1);
  }

  const packageManager = detectPackageManager();
  const spinner = p.spinner();
  spinner.start(t("add.installing", { pkg: tool.package }));

  try {
    if (tool.kind === "dependency") {
      await runCommand(packageManager, getAddArgs(packageManager, [tool.package]), { cwd });
    } else {
      await runCommand("npx", getAiInitArgs(options.agents, { tr: getLocale() === "tr" }), { cwd });
    }
    spinner.stop(t("add.done", { pkg: tool.package }));
  } catch (error) {
    spinner.stop(t("add.installFailed", { pkg: tool.package }));
    p.log.error(String(error?.message ?? error));
    process.exit(1);
  }

  await trackEvent("add", {
    tool: tool.id,
    ...(tool.id === "ai" && options.agents ? { agents: options.agents } : {}),
    packageManager,
  });
}
