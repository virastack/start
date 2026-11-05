import path from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";

import { t, getLocale } from "../i18n.js";
import { copyTemplate, dirHasFiles, isDirEmpty } from "../utils/copy-template.js";
import { runCommand } from "../utils/exec.js";
import { commitInitial, initGitRepo } from "../utils/git.js";
import { AGENTS, ALL_AGENTS, SKILLS, getAiInitArgs, getSkillArgs, getSkillsCommand } from "../utils/agents.js";
import { isOnline } from "../utils/is-online.js";
import {
  detectPackageManager,
  getAiInitCommand,
  getInstallArgs,
  getInstallCommand,
  getRunDevCommand,
} from "../utils/package-manager.js";
import { trackEvent } from "../utils/telemetry.js";
import { TOOLS, parseToolsFlag } from "../utils/tools.js";
import { setupEnvFile } from "../utils/setup-env.js";
import { setupPackageManager } from "../utils/setup-package-manager.js";
import { updatePackageJson } from "../utils/update-package-json.js";
import { updateReadme } from "../utils/update-readme.js";
import { validateProjectName } from "../utils/validate-project-name.js";
import { accent, intro, logError, spinner, stepDetail, stepLabel } from "../utils/ui.js";

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

  console.log();
  intro();


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
          // The question already says ViraStack, so the short name keeps the answer on one line.
          label: tool.id,
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

  const offline = !(await isOnline());
  const runsInstall = !skipInstall && !offline;
  const totalSteps = 2 + (runsInstall ? 1 : 0) + (offline ? 0 : 2);
  let currentStep = 0;
  const step = (text) => stepLabel(currentStep, totalSteps, text);
  // Only the long steps show a timer; a quick one would only print [0s].
  const startStep = (text, { timer = true } = {}) => {
    currentStep += 1;
    const stepSpinner = spinner({ indicator: timer ? "timer" : "dots" });
    stepSpinner.start(step(text));
    return stepSpinner;
  };

  const scaffoldSpinner = startStep(t("scaffold.copying"), { timer: false });
  await copyTemplate(templateSourceDir, targetDir);
  await updatePackageJson(targetDir, { projectName, tools });
  await updateReadme(targetDir, projectName);
  await setupEnvFile(targetDir);
  await setupPackageManager(targetDir, packageManager, {
    isYarnClassic: (process.env.npm_config_user_agent ?? "").startsWith("yarn/1."),
  });
  scaffoldSpinner.stop(step(t("scaffold.copyDone")));

  const gitInitialized = await initGitRepo(targetDir);

  let installOk = false;

  if (skipInstall) {
    p.log.info(t("scaffold.skipInstall"));
  } else if (offline) {
    p.log.warn(t("scaffold.offline"));
  } else {
    const installSpinner = startStep(t("scaffold.installing", { pm: packageManager }));
    try {
      await runCommand(packageManager, getInstallArgs(packageManager), { cwd: targetDir });
      installSpinner.stop(step(t("scaffold.installDone")));
      installOk = true;
    } catch (error) {
      installSpinner.error(step(t("scaffold.installFailed")));
      logError(error);
    }
  }

  // ViraStack AI only writes files, so it runs even with --skip-install.
  let aiOk = false;
  if (!offline) {
    const aiSpinner = startStep(t("scaffold.aiInit"));
    try {
      await runCommand("npx", getAiInitArgs(agents, { tr: getLocale() === "tr" }), { cwd: targetDir });
      aiSpinner.stop(step(t("scaffold.aiInitDone")));
      aiOk = true;
    } catch {
      aiSpinner.error(step(t("scaffold.aiInitFailed")));
    }
  }

  // Each skill installs on its own: one failing must not stop the others.
  // Like ViraStack AI, they only write files, so only offline skips them.
  let skillsOk = false;
  if (!offline) {
    const skillsSpinner = startStep(t("scaffold.skillsInit"));
    const added = [];
    const failed = [];
    for (const [index, entry] of SKILLS.entries()) {
      const name = entry.skill ?? entry.source;
      skillsSpinner.message(
        step(t("scaffold.skillsProgress", { current: index + 1, total: SKILLS.length, name })),
      );
      try {
        await runCommand("npx", getSkillArgs(entry, agents), { cwd: targetDir });
        added.push(name);
      } catch {
        failed.push(name);
      }
    }
    skillsOk = failed.length === 0;
    if (skillsOk) {
      skillsSpinner.stop(step(t("scaffold.skillsInitDone")));
      stepDetail(currentStep, totalSteps, added.join(", "));
    } else {
      skillsSpinner.error(
        step(t("scaffold.skillsInitFailed", { failed: failed.length, total: SKILLS.length })),
      );
      stepDetail(currentStep, totalSteps, failed.join(", "));
    }
  }

  // Last, so the first commit contains every generated file.
  const gitSpinner = startStep(t("scaffold.gitInit"), { timer: false });
  const committed = gitInitialized && (await commitInitial(targetDir));
  gitSpinner.stop(step(committed ? t("scaffold.gitInitDone") : t("scaffold.gitInitSkipped")));

  await trackEvent("create", {
    template,
    i18n: wantsI18n,
    tools,
    agents,
    packageManager,
    installOk,
    skipInstall,
  });

  const commands = [];
  if (!useCurrentDir) commands.push(`cd ${projectName}`);
  if (!installOk) commands.push(getInstallCommand(packageManager));
  if (!aiOk) commands.push(getAiInitCommand(agents));
  if (!skillsOk) commands.push(getSkillsCommand());
  commands.push(getRunDevCommand(packageManager));

  const installFailed = runsInstall && !installOk;
  if (installFailed) p.log.error(t("done.installFailedNote"));
  const steps = commands.map((cmd) => accent(cmd));
  p.log.step([t("done.nextSteps"), "", ...steps].join("\n"));
  p.outro(installOk ? "" : t("done.partialTitle"));
  if (installFailed) process.exitCode = 1;
}
