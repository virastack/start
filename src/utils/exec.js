import spawn from "cross-spawn";

/**
 * Runs a command and resolves once it exits successfully, rejecting otherwise.
 * Uses cross-spawn so package manager shims (npm.cmd, pnpm.cmd, ...) resolve on Windows too.
 */
export function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore", ...options });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`"${command} ${args.join(" ")}" exited with code ${code}`));
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
