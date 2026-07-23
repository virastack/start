import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import pc from "picocolors";

import { t } from "../i18n.js";
import { copyTemplate, dirHasFiles, isDirEmpty } from "../utils/copy-template.js";
import { runCommand } from "../utils/exec.js";
import { initGitRepo } from "../utils/git.js";
import { detectPackageManager, getInstallArgs, getRunDevCommand } from "../utils/package-manager.js";
import { trackEvent, isTelemetryDisabled, hasSeenTelemetryNotice, markTelemetryNoticeShown } from "../utils/telemetry.js";
import { TOOLS } from "../utils/tools.js";
import { setupEnvFile } from "../utils/setup-env.js";
import { updatePackageJson } from "../utils/update-package-json.js";
import { validateProjectName } from "../utils/validate-project-name.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../../templates");
const TEMPLATES_I18N_DIR = path.resolve(__dirname, "../../templates-i18n");

function cancelAndExit() {
  p.cancel(t("cancel"));
  process.exit(0);
}

export async function runInit() {
  console.log();
  p.intro(pc.bgMagenta(pc.black(" ViraStack ")));

  if (!(await isTelemetryDisabled()) && !(await hasSeenTelemetryNotice())) {
    p.log.info(t("telemetry.notice"));
    await markTelemetryNoticeShown();
  }

  const projectNameInput = await p.text({
    message: t("projectName.message"),
    placeholder: t("projectName.placeholder"),
    validate: (value) => {
      const error = validateProjectName(value);
      if (error === "empty") return t("projectName.errorEmpty");
      if (error === "invalid") return t("projectName.errorInvalid");
    },
  });
  if (p.isCancel(projectNameInput)) return cancelAndExit();

  const useCurrentDir = projectNameInput === ".";
  const targetDir = useCurrentDir
    ? process.cwd()
    : path.resolve(process.cwd(), projectNameInput);
  const projectName = useCurrentDir ? path.basename(targetDir) : projectNameInput;

  if (!(await isDirEmpty(targetDir))) {
    const proceed = await p.confirm({
      message: t("projectName.confirmNonEmptyDir", {
        dir: useCurrentDir ? "." : projectNameInput,
      }),
      initialValue: false,
    });
    if (p.isCancel(proceed) || !proceed) return cancelAndExit();
  }

  let template = await p.select({
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

  if (template === "tanstack" && !(await dirHasFiles(path.join(TEMPLATES_DIR, "tanstack")))) {
    p.log.warn(t("template.tanstack.notReady"));
    template = "nextjs";
  }

  let wantsI18n = await p.confirm({
    message: t("i18n.message"),
    active: t("i18n.active"),
    inactive: t("i18n.inactive"),
    initialValue: false,
  });
  if (p.isCancel(wantsI18n)) return cancelAndExit();

  if (wantsI18n && !(await dirHasFiles(path.join(TEMPLATES_I18N_DIR, template)))) {
    p.log.warn(t("i18n.notReady"));
    wantsI18n = false;
  }

  const tools = await p.multiselect({
    message: t("tools.message"),
    required: false,
    options: TOOLS.filter(t => !t.hiddenFromInit).map((tool) => ({
      value: tool.id,
      label: t(`tools.${tool.id}.label`),
      hint: t(`tools.${tool.id}.hint`),
    })),
  });
  if (p.isCancel(tools)) return cancelAndExit();

  const packageManager = detectPackageManager();
  const templateSourceDir = path.join(
    wantsI18n ? TEMPLATES_I18N_DIR : TEMPLATES_DIR,
    template,
  );

  const scaffoldSpinner = p.spinner();
  scaffoldSpinner.start(t("scaffold.copying"));
  await copyTemplate(templateSourceDir, targetDir);
  await updatePackageJson(targetDir, { projectName, tools });
  await setupEnvFile(targetDir);
  scaffoldSpinner.stop(t("scaffold.copyDone"));

  const gitSpinner = p.spinner();
  gitSpinner.start(t("scaffold.gitInit"));
  const gitInitialized = await initGitRepo(targetDir);
  gitSpinner.stop(
    gitInitialized ? t("scaffold.gitInitDone") : t("scaffold.gitInitSkipped"),
  );

  const installSpinner = p.spinner();
  installSpinner.start(t("scaffold.installing", { pm: packageManager }));
  try {
    await runCommand(packageManager, getInstallArgs(), { cwd: targetDir });
    installSpinner.stop(t("scaffold.installDone"));
  } catch (error) {
    installSpinner.stop(t("scaffold.installFailed"));
    p.log.error(String(error?.message ?? error));
  }

  const aiSpinner = p.spinner();
  aiSpinner.start(t("scaffold.aiInit"));
  try {
    const args = ["--yes", "@virastack/ai", "init", "--force"];
    if (getLocale() === "tr") args.push("--tr");
    await runCommand("npx", args, { cwd: targetDir });
    aiSpinner.stop(t("scaffold.aiInitDone"));
  } catch (err) {
    aiSpinner.stop(t("scaffold.aiInitFailed"));
  }

  await trackEvent("create", { template, i18n: wantsI18n, tools, packageManager });

  const outroLines = [t("done.title")];
  if (!useCurrentDir) outroLines.push(t("done.cd", { dir: projectName }));
  outroLines.push(t("done.dev", { cmd: getRunDevCommand(packageManager) }));

  p.outro(outroLines.join("\n"));
}
