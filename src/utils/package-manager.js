import { formatAgents, getAiPackageSpec } from "./agents.js";

/**
 * Detects the package manager the CLI was invoked with, mirroring the
 * technique used by create-next-app and create-vite (npm_config_user_agent).
 * We never ask the user for this — it keeps the interactive flow short.
 */
export function detectPackageManager() {
  const userAgent = process.env.npm_config_user_agent ?? "";

  if (userAgent.startsWith("pnpm")) return "pnpm";
  if (userAgent.startsWith("yarn")) return "yarn";
  if (userAgent.startsWith("bun")) return "bun";
  return "npm";
}

export function getInstallArgs(pm) {
  return pm === "npm" ? ["install", "--legacy-peer-deps"] : ["install"];
}

export function getAddArgs(pm, packages) {
  return pm === "npm" ? ["install", "--legacy-peer-deps", ...packages] : ["add", ...packages];
}

export function getInstallCommand(pm) {
  return pm === "npm" ? "npm install" : `${pm} install`;
}

export function getRunDevCommand(pm) {
  return pm === "npm" ? "npm run dev" : `${pm} dev`;
}

/** Manual ViraStack AI command for the selected agents (never `--force`). */
export function getAiInitCommand(agents) {
  return `npx ${getAiPackageSpec()} init --agent ${formatAgents(agents)}`;
}
