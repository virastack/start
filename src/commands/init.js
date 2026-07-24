import path from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import pc from "picocolors";

import { t, getLocale } from "../i18n.js";
import { copyTemplate, dirHasFiles, isDirEmpty } from "../utils/copy-template.js";
import { runCommand } from "../utils/exec.js";
import { initGitRepo } from "../utils/git.js";
import { isOnline } from "../utils/is-online.js";
import {
  detectPackageManager,
  getAiInitCommand,
  getInstallArgs,
  getInstallCommand,
  getRunDevCommand,
} from "../utils/package-manager.js";
import { trackEvent, isTelemetryDisabled, hasSeenTelemetryNotice, markTelemetryNoticeShown } from "../utils/telemetry.js";
import { TOOLS, parseToolsFlag } from "../utils/tools.js";
import { setupEnvFile } from "../utils/setup-env.js";
import { updatePackageJson } from "../utils/update-package-json.js";
import { updateReadme } from "../utils/update-readme.js";
import { validateProjectName } from "../utils/validate-project-name.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");
const TEMPLATES_I18N_DIR = path.resolve(__dirname, "../../templates-i18n");
const VALID_TEMPLATES = new Set(["nextjs", "tanstack"]);

function cancelAndExit() {
  p.cancel(t("cancel"));
  process.exit(0);
}

function failAndExit(message) {
  p.log.error(message);
  process.exit(1);
}

/**
 * @param {{
 *   name?: string,
 *   template?: string,
 *   i18n?: boolean,
 *   tools?: string[] | string | true,
 *   yes?: boolean,
 *   skipInstall?: boolean,
 * }} [options]
 */
export async function runInit(options = {}) {
  const yes = Boolean(options.yes);
  const skipInstall = Boolean(options.skipInstall);

  console.clear();
  p.intro(pc.bgMagenta(pc.black(" ViraStack ")));

  if (!(await isTelemetryDisabled()) && !(await hasSeenTelemetryNotice())) {
    p.log.info(t("telemetry.notice"));
    await markTelemetryNoticeShown();
  }

  let projectNameInput = options.name;

  if (projectNameInput == null) {
    if (yes) {
      failAndExit(t("projectName.errorNonInteractive"));
    }

    projectNameInput = await p.text({
      message: t("projectName.message"),
      placeholder: t("projectName.placeholder"),
      validate: (value) => {
        const error = validateProjectName(value);
        if (error === "empty") return t("projectName.errorEmpty");
        if (error === "invalid") return t("projectName.errorInvalid");
      },
    });
    if (p.isCancel(projectNameInput)) return cancelAndExit();
  } else {
    const error = validateProjectName(projectNameInput);
    if (error === "empty") failAndExit(t("projectName.errorEmpty"));
    if (error === "invalid") failAndExit(t("projectName.errorInvalid"));
  }

  const useCurrentDir = projectNameInput === ".";
  const targetDir = useCurrentDir
    ? process.cwd()
    : path.resolve(process.cwd(), projectNameInput);
  const projectName = useCurrentDir ? path.basename(targetDir) : projectNameInput;

  if (!(await isDirEmpty(targetDir))) {
    if (yes) {
      p.log.warn(
        t("projectName.confirmNonEmptyDir", {
          dir: useCurrentDir ? "." : projectNameInput,
        }),
      );
    } else {
      const proceed = await p.confirm({
        message: t("projectName.confirmNonEmptyDir", {
          dir: useCurrentDir ? "." : projectNameInput,
        }),
        initialValue: false,
      });
      if (p.isCancel(proceed) || !proceed) return cancelAndExit();
    }
  }

  let template = options.template;
  if (template != null && !VALID_TEMPLATES.has(template)) {
    failAndExit(t("template.errorInvalid", { template }));
  }

  if (template == null) {
    if (yes) {
      template = "nextjs";
    } else {
      template = await p.select({
        message: t("template.message"),
        options: [
          {
            value: "nextjs",
            label: t("template.nextjs.label"),
            hint: t("template.nextjs.hint"),
          },
          {
            value: "tanstack",
            label: t("template.tanstack.label"),
            hint: t("template.tanstack.hint"),
          },
        ],
      });
      if (p.isCancel(template)) return cancelAndExit();
    }
  }

  if (template === "tanstack" && !(await dirHasFiles(path.join(TEMPLATES_DIR, "tanstack")))) {
    p.log.warn(t("template.tanstack.notReady"));
    template = "nextjs";
  }

  let wantsI18n = options.i18n;
  if (wantsI18n == null) {
    if (yes) {
      wantsI18n = false;
    } else {
      wantsI18n = await p.confirm({
        message: t("i18n.message"),
        active: t("i18n.active"),
        inactive: t("i18n.inactive"),
        initialValue: false,
      });
      if (p.isCancel(wantsI18n)) return cancelAndExit();
    }
  }

  if (wantsI18n && !(await dirHasFiles(path.join(TEMPLATES_I18N_DIR, template)))) {
    p.log.warn(t("i18n.notReady"));
    wantsI18n = false;
  }

  let tools = options.tools;
  if (tools == null) {
    if (yes) {
      tools = [];
    } else {
      tools = await p.multiselect({
        message: t("tools.message"),
        required: false,
        options: TOOLS.filter((tool) => !tool.hiddenFromInit).map((tool) => ({
          value: tool.id,
          label: t(`tools.${tool.id}.label`),
          hint: t(`tools.${tool.id}.hint`),
        })),
      });
      if (p.isCancel(tools)) return cancelAndExit();
    }
  } else {
    tools = Array.isArray(tools) ? tools : parseToolsFlag(tools);
  }

  const packageManager = detectPackageManager();
  const templateSourceDir = path.join(
    wantsI18n ? TEMPLATES_I18N_DIR : TEMPLATES_DIR,
    template,
  );

  const scaffoldSpinner = p.spinner();
  scaffoldSpinner.start(t("scaffold.copying"));
  await copyTemplate(templateSourceDir, targetDir);
  await updatePackageJson(targetDir, { projectName, tools });
  await updateReadme(targetDir, projectName);
  await setupEnvFile(targetDir);
  scaffoldSpinner.stop(t("scaffold.copyDone"));

  const gitSpinner = p.spinner();
  gitSpinner.start(t("scaffold.gitInit"));
  const gitInitialized = await initGitRepo(targetDir);
  gitSpinner.stop(
    gitInitialized ? t("scaffold.gitInitDone") : t("scaffold.gitInitSkipped"),
  );

  const online = await isOnline();
  let installOk = false;
  let aiOk = false;
  let offline = false;

  if (skipInstall) {
    p.log.info(t("scaffold.skipInstall"));
  } else if (!online) {
    offline = true;
    p.log.warn(t("scaffold.offline"));
  } else {
    const installSpinner = p.spinner();
    installSpinner.start(t("scaffold.installing", { pm: packageManager }));
    try {
      await runCommand(packageManager, getInstallArgs(), { cwd: targetDir });
      installSpinner.stop(t("scaffold.installDone"));
      installOk = true;
    } catch (error) {
      installSpinner.stop(t("scaffold.installFailed"));
      p.log.error(String(error?.message ?? error));
    }

    if (installOk) {
      const aiSpinner = p.spinner();
      aiSpinner.start(t("scaffold.aiInit"));
      try {
        const args = ["--yes", "@virastack/ai", "init", "--force"];
        if (getLocale() === "tr") args.push("--tr");
        await runCommand("npx", args, { cwd: targetDir });
        aiSpinner.stop(t("scaffold.aiInitDone"));
        aiOk = true;
      } catch {
        aiSpinner.stop(t("scaffold.aiInitFailed"));
      }
    } else {
      p.log.warn(t("scaffold.aiInitSkipped"));
    }
  }

  await trackEvent("create", {
    template,
    i18n: wantsI18n,
    tools,
    packageManager,
    installOk,
    skipInstall,
  });

  const cdHint = useCurrentDir ? null : t("done.cd", { dir: projectName });
  const installCmd = getInstallCommand(packageManager);
  const aiCmd = getAiInitCommand();
  const devCmd = getRunDevCommand(packageManager);

  if (skipInstall || offline || !installOk) {
    const outroLines = [t("done.partialTitle")];
    if (cdHint) outroLines.push(cdHint);
    outroLines.push(t("done.manualInstall", { cmd: installCmd }));
    outroLines.push(t("done.manualAi", { cmd: aiCmd }));
    outroLines.push(t("done.dev", { cmd: devCmd }));
    if (!installOk && !offline && !skipInstall) {
      p.log.error(t("done.installFailedNote"));
    }
    p.outro(outroLines.join("\n"));
    if (!installOk && !offline && !skipInstall) {
      process.exitCode = 1;
    }
    return;
  }

  const outroLines = [t("done.title")];
  if (cdHint) outroLines.push(cdHint);
  if (!aiOk) outroLines.push(t("done.manualAi", { cmd: aiCmd }));
  outroLines.push(t("done.dev", { cmd: devCmd }));
  p.outro(outroLines.join("\n"));
}
