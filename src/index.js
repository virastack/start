import { parseArgs } from "./utils/args.js";
import { getCliVersion } from "./utils/package-info.js";
import { disableTelemetry } from "./utils/telemetry.js";
import { setLocale, t } from "./i18n.js";
import { runInit } from "./commands/init.js";
import { runAdd } from "./commands/add.js";

export async function main() {
  const { positionals, flags } = parseArgs(process.argv);
  setLocale(flags.has("tr") ? "tr" : "en");

  if (flags.has("telemetry-disable")) {
    await disableTelemetry();
  }

  if (flags.has("v") || flags.has("version")) {
    console.log(getCliVersion());
    return;
  }

  if (flags.has("h") || flags.has("help")) {
    console.log(t("help"));
    return;
  }

  const [command, ...rest] = positionals;

  switch (command) {
    case undefined:
    case "init":
      await runInit();
      break;
    case "add":
      await runAdd(rest[0]);
      break;
    default:
      console.log(t("help"));
  }
}
