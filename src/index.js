import { getFlag, hasFlag, parseArgs } from "./utils/args.js";
import { getCliVersion } from "./utils/package-info.js";
import { disableTelemetry } from "./utils/telemetry.js";
import { setLocale, t } from "./i18n.js";
import { runInit } from "./commands/init.js";
import { runAdd } from "./commands/add.js";
import { parseToolsFlag } from "./utils/tools.js";
import { parseAgentFlag } from "./utils/agents.js";

function resolveI18nFlag(flags) {
  if (hasFlag(flags, "no-i18n")) return false;
  if (hasFlag(flags, "i18n")) return true;
  return undefined;
}

/** `--agent` as a list of ids, undefined when absent. Exits on an invalid value. */
function resolveAgentFlag(flags) {
  const value = getFlag(flags, "agent");
  if (value === undefined) return undefined;
  const agents = parseAgentFlag(value);
  if (agents === null) {
    console.error(t("agent.errorInvalid", { value: value === true ? "" : value }));
    process.exit(1);
  }
  return agents;
}

function buildInitOptions(flags, projectName) {
  const nameFlag = getFlag(flags, "name");
  const template = getFlag(flags, "template");
  const tools = getFlag(flags, "tools");

  return {
    name: projectName ?? (typeof nameFlag === "string" ? nameFlag : undefined),
    template: typeof template === "string" ? template : undefined,
    i18n: resolveI18nFlag(flags),
    tools: tools === undefined ? undefined : parseToolsFlag(tools),
    agents: resolveAgentFlag(flags),
    yes: hasFlag(flags, "yes", "y"),
    skipInstall: hasFlag(flags, "skip-install"),
  };
}

export async function main() {
  const { positionals, flags } = parseArgs(process.argv);
  setLocale(hasFlag(flags, "tr") ? "tr" : "en");

  if (hasFlag(flags, "telemetry-disable")) {
    await disableTelemetry();
  }

  if (hasFlag(flags, "v", "version")) {
    console.log(getCliVersion());
    return;
  }

  if (hasFlag(flags, "h", "help")) {
    console.log(t("help"));
    return;
  }

  const [command, ...rest] = positionals;

  switch (command) {
    case undefined:
      await runInit(buildInitOptions(flags));
      break;
    case "init":
      await runInit(buildInitOptions(flags, rest[0]));
      break;
    case "add":
      await runAdd(rest[0], { agents: resolveAgentFlag(flags) });
      break;
    default:
      // `pnpm dlx virastack my-app --yes` — first token is the project name.
      await runInit(buildInitOptions(flags, command));
  }
}
