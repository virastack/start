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
 * Best-effort `git init`. Runs before the dependency install so the
 * template's `prepare` script (husky) can install its hooks. Never throws:
 * a missing git binary or an existing repo (e.g. a monorepo) should not fail
 * the scaffold. Returns whether a new repo was created.
 */
export async function initGitRepo(dir) {
  if (!(await commandExists("git"))) return false;
  if (await isInsideGitRepo(dir)) return false;

  try {
    await runCommand("git", ["init"], { cwd: dir });
    return true;
  } catch {
    return false;
  }
}

/**
 * Commits every file as the initial commit, after all setup steps ran so the
 * working tree is clean. Hooks are skipped: they lint the user's own changes,
 * not the generated scaffold. Never throws; returns whether it committed.
 */
export async function commitInitial(dir) {
  try {
    await runCommand("git", ["add", "-A"], { cwd: dir });
    await runCommand("git", ["commit", "--no-verify", "-m", "chore: initial commit from virastack"], {
      cwd: dir,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "ViraStack Start",
        GIT_AUTHOR_EMAIL: "noreply@virastack.com",
        GIT_COMMITTER_NAME: "ViraStack Start",
        GIT_COMMITTER_EMAIL: "noreply@virastack.com",
      },
    });
    return true;
  } catch {
    return false;
  }
}
