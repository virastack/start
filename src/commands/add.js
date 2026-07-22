import path from "node:path";
import { promises as fs } from "node:fs";
import * as p from "@clack/prompts";
import pc from "picocolors";

import { t } from "../i18n.js";
import { runCommand } from "../utils/exec.js";
import { detectPackageManager, getAddArgs } from "../utils/package-manager.js";
import { trackEvent } from "../utils/telemetry.js";
import { findTool, TOOLS } from "../utils/tools.js";

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function runAdd(toolId) {
  console.log();
  p.intro(pc.bgMagenta(pc.black(" ViraStack ")));

  const toolList = TOOLS.map((tool) => tool.id).join(", ");

  if (!toolId) {
    p.log.error(t("add.toolMissing", { list: toolList }));
    process.exit(1);
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
      await runCommand("npx", ["--yes", tool.package, "init"], { cwd });
    }
    spinner.stop(t("add.done", { pkg: tool.package }));
  } catch (error) {
    spinner.stop(t("add.installFailed", { pkg: tool.package }));
    p.log.error(String(error?.message ?? error));
    process.exit(1);
  }

  await trackEvent("add", { tool: tool.id, packageManager });

  p.outro(t("done.title"));
}
