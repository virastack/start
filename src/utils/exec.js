import { stripVTControlCharacters } from "node:util";

import spawn from "cross-spawn";

const MAX_KEPT_OUTPUT = 4000;
const ERROR_LINES = 20;

function lastLines(output) {
  return stripVTControlCharacters(output).split("\n").filter((line) => line.trim()).slice(-ERROR_LINES).join("\n");
}

/**
 * Runs a command and resolves once it exits successfully, rejecting otherwise.
 * Uses cross-spawn so package manager shims (npm.cmd, pnpm.cmd, ...) resolve on Windows too.
 * Output stays hidden; a failure carries its last lines, so the reason reaches the user.
 *
 * @param {string} command
 * @param {string[]} [args]
 * @param {import("node:child_process").SpawnOptions} [options]
 * @returns {Promise<void>}
 */
export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"], ...options });

    let output = "";
    const keep = (chunk) => {
      output = `${output}${chunk}`.slice(-MAX_KEPT_OUTPUT);
    };
    child.stdout?.on("data", keep);
    child.stderr?.on("data", keep);

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        const summary = `"${command} ${args.join(" ")}" exited with code ${code}`;
        reject(new Error([summary, lastLines(output)].filter(Boolean).join("\n")));
      }
    });
  });
}

export async function commandExists(command) {
  try {
    await runCommand(command, ["--version"]);
    return true;
  } catch {
    return false;
  }
}
