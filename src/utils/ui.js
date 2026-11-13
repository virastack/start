import * as p from "@clack/prompts";
import pc from "picocolors";

import { t } from "../i18n.js";
import { getCliVersion } from "./package-info.js";

const SHOWN_ERROR_LINES = 8;

/** The CLI's accent: the terminal's own cyan, so it follows the user's theme. */
export const accent = pc.cyan;

export function intro() {
  p.intro(`${pc.bgCyan(pc.black(" ViraStack "))} ${pc.dim(`v${getCliVersion()}`)}`);
}

// clack prints the spinner timer as a plain `[12s]` and has no option to style
// it, so the timer at the end of a written line is dimmed on its way out.
const TIMER = / \[(?:\d+m )?\d+s\](?=\n|$)/;
const dimTimerOutput = new Proxy(process.stdout, {
  get(target, key) {
    if (key === "write") {
      return (chunk, ...rest) =>
        target.write(
          typeof chunk === "string"
            ? chunk.replace(TIMER, (timer) => ` ${pc.dim(timer.trim())}`)
            : chunk,
          ...rest,
        );
    }
    const value = Reflect.get(target, key, target);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

/** A clack spinner whose frames use the accent color and whose timer is dimmed. */
export function spinner(options = {}) {
  return p.spinner({ styleFrame: accent, output: dimTimerOutput, ...options });
}

/** `[2/5] Installing...`, the counter in the accent color. */
export function stepLabel(step, total, text) {
  return `${accent(`[${step}/${total}]`)} ${text}`;
}

/** A dimmed line under a step, lined up with the step's text after `[n/total]`. */
export function stepDetail(step, total, text) {
  const indent = " ".repeat(`[${step}/${total}] `.length);
  process.stdout.write(`${pc.gray(p.S_BAR)}  ${indent}${pc.dim(text)}\n`);
}

/**
 * Logs a failure: the first line in red, the command's last lines dimmed under it.
 * @param {unknown} error
 */
export function logError(error) {
  const [summary, ...rest] = String(error instanceof Error ? error.message : error).split("\n");
  const details = rest.slice(-SHOWN_ERROR_LINES).map((line) => pc.dim(line));
  p.log.error([summary, ...details].join("\n"));
}

/**
 * Colors the help text: headings bold, commands and flags cyan, examples cyan.
 * Text only changes color, so the layout stays the same without colors.
 * @param {string} text
 */
export function formatHelp(text) {
  const lines = text.split("\n");
  const lastHeading = lines.findLastIndex((line) => /^\S.*:$/.test(line));
  return lines
    .map((line, index) => {
      if (/^\S.*:$/.test(line)) return pc.bold(line);
      if (index > lastHeading && line.trim()) return pc.cyan(line);
      const match = line.match(/^(\s+)(\S.*?)(\s{2,})(\S.*)$/);
      return match ? `${match[1]}${pc.cyan(match[2])}${match[3]}${match[4]}` : line;
    })
    .join("\n");
}

/**
 * Generated files that could not be written are warnings only: the module's files are in place,
 * and the dev server or the project's own script writes them too.
 * @param {{ routeTree?: string, messages?: string }} generated
 */
export function warnGenerated({ routeTree, messages } = {}) {
  if (messages === "failed") p.log.warn(t("add.messagesFailed"));
  if (routeTree === "missing") p.log.warn(t("add.routeTreeMissing"));
  if (routeTree === "failed") p.log.warn(t("add.routeTreeFailed"));
}
