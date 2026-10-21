import { getCliVersion } from "./package-info.js";

/**
 * AI coding tools the CLI can set up. `skillsAgent` is the matching
 * `skills` CLI agent id (https://github.com/vercel-labs/skills).
 */
export const AGENTS = [
  { id: "claude", skillsAgent: "claude-code" },
  { id: "cursor", skillsAgent: "cursor" },
];

export const ALL_AGENTS = AGENTS.map((agent) => agent.id);

/**
 * Parses `--agent claude,cursor` / `--agent none`.
 * Returns the selected ids in canonical order, or null when the value is
 * missing or names an unknown tool.
 */
export function parseAgentFlag(value) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 1 && parts[0] === "none") return [];
  if (parts.length === 0 || parts.some((part) => !ALL_AGENTS.includes(part))) return null;
  return ALL_AGENTS.filter((id) => parts.includes(id));
}

/** `--agent` value for @virastack/ai: "claude,cursor", "cursor" or "none". */
export function formatAgents(agents) {
  return agents.length === 0 ? "none" : agents.join(",");
}

/**
 * npm spec for @virastack/ai. A prerelease of this CLI pairs with the ai
 * prerelease channel (`next`), a stable release with ai v2.
 * VIRASTACK_AI_SPEC overrides it (e.g. `file:` + a local tarball in end-to-end tests).
 */
export function getAiPackageSpec(cliVersion = getCliVersion()) {
  if (process.env.VIRASTACK_AI_SPEC) return process.env.VIRASTACK_AI_SPEC;
  return `@virastack/ai@${cliVersion.includes("-") ? "next" : "2"}`;
}

/**
 * Arguments for `npx`. Never `--force`, so files the user changed are kept.
 * Without `agents`, ViraStack AI reuses the saved choice (or installs both).
 */
export function getAiInitArgs(agents, { tr = false } = {}) {
  const args = ["--yes", getAiPackageSpec(), "init"];
  if (agents) args.push("--agent", formatAgents(agents));
  args.push("--yes");
  if (tr) args.push("--tr");
  return args;
}

/** Design skills installed for the selected agents, one `skills add` call each. */
export const SKILLS = [
  { source: "emilkowalski/skills", skill: "emil-design-eng" },
  { source: "jakubkrehel/make-interfaces-feel-better" },
];

/**
 * Arguments for `npx skills@latest add`. `--copy` writes real files instead
 * of symlinks so the first commit works the same on Windows.
 */
export function getSkillArgs({ source, skill }, agents) {
  const args = ["--yes", "skills@latest", "add", source];
  if (skill) args.push("--skill", skill);
  for (const id of agents) args.push("-a", AGENTS.find((agent) => agent.id === id).skillsAgent);
  args.push("--copy", "-y");
  return args;
}

/** Manual command for the skills (interactive), shown when they were not installed. */
export function getSkillsCommand() {
  return SKILLS.map(({ source, skill }) =>
    ["npx skills@latest add", source, ...(skill ? ["--skill", skill] : [])].join(" "),
  ).join(" && ");
}
