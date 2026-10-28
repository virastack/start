import path from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import pc from "picocolors";

import { t, getLocale } from "../i18n.js";
import { copyTemplate, dirHasFiles, isDirEmpty } from "../utils/copy-template.js";
import { runCommand } from "../utils/exec.js";
import { commitInitial, initGitRepo } from "../utils/git.js";
import { AGENTS, ALL_AGENTS, SKILLS, getAiInitArgs, getSkillArgs, getSkillsCommand } from "../utils/agents.js";
import { writeNextAgentsBlock } from "../utils/next-agents-md.js";
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

/** @returns {never} */
function cancelAndExit() {
  p.cancel(t("cancel"));
  process.exit(0);
}

/**
 * @param {string} message
 * @returns {never}
 */
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
 *   agents?: string[],
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

    const name = await p.text({
      message: t("projectName.message"),
      placeholder: t("projectName.placeholder"),
      validate: (value) => {
        const error = validateProjectName(value);
        if (error === "empty") return t("projectName.errorEmpty");
        if (error === "invalid") return t("projectName.errorInvalid");
      },
    });
    if (p.isCancel(name)) return cancelAndExit();
    projectNameInput = name;
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
      const chosenTemplate = await p.select({
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
      if (p.isCancel(chosenTemplate)) return cancelAndExit();
      template = chosenTemplate;
    }
  }

  if (template === "tanstack" && !(await dirHasFiles(path.join(TEMPLATES_DIR, "tanstack")))) {
    p.log.warn(t("template.tanstack.notReady"));
    template = "nextjs";
  }

  let agents = options.agents;
  if (agents == null) {
    if (yes) {
      agents = ALL_AGENTS;
    } else {
      const selected = await p.multiselect({
        message: t("agents.message"),
        required: false,
        initialValues: ALL_AGENTS,
        options: AGENTS.map((agent) => ({
          value: agent.id,
          label: t(`agents.${agent.id}.label`),
        })),
      });
      if (p.isCancel(selected)) return cancelAndExit();
      agents = ALL_AGENTS.filter((id) => selected.includes(id));
    }
  }

  let wantsI18n = options.i18n;
  if (wantsI18n == null) {
    if (yes) {
      wantsI18n = false;
    } else {
      const chosenI18n = await p.confirm({
        message: t("i18n.message"),
        active: t("i18n.active"),
        inactive: t("i18n.inactive"),
        initialValue: false,
      });
      if (p.isCancel(chosenI18n)) return cancelAndExit();
      wantsI18n = chosenI18n;
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
      const chosenTools = await p.multiselect({
        message: t("tools.message"),
        required: false,
        options: TOOLS.filter((tool) => !tool.hiddenFromInit).map((tool) => ({
          value: tool.id,
          label: t(`tools.${tool.id}.label`),
          hint: t(`tools.${tool.id}.hint`),
        })),
      });
      if (p.isCancel(chosenTools)) return cancelAndExit();
      tools = chosenTools;
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

  const gitInitialized = await initGitRepo(targetDir);

  const online = await isOnline();
  let installOk = false;
  const offline = !online;

  if (skipInstall) {
    p.log.info(t("scaffold.skipInstall"));
  } else if (offline) {
    p.log.warn(t("scaffold.offline"));
  } else {
    const installSpinner = p.spinner();
    installSpinner.start(t("scaffold.installing", { pm: packageManager }));
    try {
      await runCommand(packageManager, getInstallArgs(packageManager), { cwd: targetDir });
      installSpinner.stop(t("scaffold.installDone"));
      installOk = true;
    } catch (error) {
      installSpinner.stop(t("scaffold.installFailed"));
      p.log.error(String(error?.message ?? error));
    }
  }

  if (template === "nextjs") {
    await writeNextAgentsBlock(targetDir);
  }

  // ViraStack AI only writes files, so it runs even with --skip-install.
  let aiOk = false;
  if (!offline) {
    const aiSpinner = p.spinner();
    aiSpinner.start(t("scaffold.aiInit"));
    try {
      await runCommand("npx", getAiInitArgs(agents, { tr: getLocale() === "tr" }), { cwd: targetDir });
      aiSpinner.stop(t("scaffold.aiInitDone"));
      aiOk = true;
    } catch {
      aiSpinner.stop(t("scaffold.aiInitFailed"));
    }
  }

  // Each skill installs on its own: one failing must not stop the others.
  // Like ViraStack AI, they only write files, so only offline skips them.
  let skillsOk = false;
  if (!offline) {
    const skillsSpinner = p.spinner();
    skillsSpinner.start(t("scaffold.skillsInit"));
    let failed = 0;
    for (const entry of SKILLS) {
      try {
        await runCommand("npx", getSkillArgs(entry, agents), { cwd: targetDir });
      } catch {
        failed += 1;
      }
    }
    skillsOk = failed === 0;
    skillsSpinner.stop(skillsOk ? t("scaffold.skillsInitDone") : t("scaffold.skillsInitFailed"));
  }

  // Last, so the first commit contains every generated file.
  const gitSpinner = p.spinner();
  gitSpinner.start(t("scaffold.gitInit"));
  const committed = gitInitialized && (await commitInitial(targetDir));
  gitSpinner.stop(committed ? t("scaffold.gitInitDone") : t("scaffold.gitInitSkipped"));

  await trackEvent("create", {
    template,
    i18n: wantsI18n,
    tools,
    agents,
    packageManager,
    installOk,
    skipInstall,
  });

  const cdHint = useCurrentDir ? null : t("done.cd", { dir: projectName });
  const installCmd = getInstallCommand(packageManager);
  const aiCmd = getAiInitCommand(agents);
  const skillsCmd = getSkillsCommand();
  const devCmd = getRunDevCommand(packageManager);

  if (skipInstall || offline || !installOk) {
    const outroLines = [t("done.partialTitle")];
    if (cdHint) outroLines.push(cdHint);
    outroLines.push(t("done.manualInstall", { cmd: installCmd }));
    if (!aiOk) outroLines.push(t("done.manualAi", { cmd: aiCmd }));
    if (!skillsOk) outroLines.push(t("done.manualSkills", { cmd: skillsCmd }));
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
  if (!skillsOk) outroLines.push(t("done.manualSkills", { cmd: skillsCmd }));
  outroLines.push(t("done.dev", { cmd: devCmd }));
  p.outro(outroLines.join("\n"));
}
