import { runCommand, commandExists } from "./exec.js";

export async function isInsideGitRepo(dir) {
  try {
    await runCommand("git", ["rev-parse", "--is-inside-work-tree"], { cwd: dir });
    return true;
  } catch {
    return false;
  }
}

/**
 * Best-effort git init + initial commit. Never throws: a missing git binary
 * or an already-initialized repo (e.g. scaffolding into a monorepo) should
 * not fail the whole scaffold. Returns whether a new repo was created.
 */
export async function initGitRepo(dir) {
  if (!(await commandExists("git"))) return false;
  if (await isInsideGitRepo(dir)) return false;

  try {
    await runCommand("git", ["init"], { cwd: dir });
    await runCommand("git", ["add", "-A"], { cwd: dir });
    await runCommand("git", ["commit", "-m", "chore: initial commit from virastack"], {
      cwd: dir,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "ViraStack Start",
        GIT_AUTHOR_EMAIL: "cli@virastack.com",
        GIT_COMMITTER_NAME: "ViraStack Start",
        GIT_COMMITTER_EMAIL: "cli@virastack.com",
      },
    });
    return true;
  } catch {
    return false;
  }
}
