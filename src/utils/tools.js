/**
 * Registry of ViraStack tools the CLI knows how to wire up.
 *
 * - "dependency" tools are added straight to package.json and installed
 *   like any other npm package (e.g. @virastack/mask).
 * - "postinstall-cli" tools ship their own `init` command that writes files
 *   into the target project (e.g. @virastack/ai writes .cursor/rules), so we
 *   shell out to them instead of treating them as a runtime dependency.
 */
export const TOOLS = [
  {
    id: "mask",
    package: "@virastack/mask",
    kind: "dependency",
    version: "^1.0.0",
  },
  {
    id: "password",
    package: "@virastack/password",
    kind: "dependency",
    version: "^1.0.0",
  },
  {
    id: "ai",
    package: "@virastack/ai",
    kind: "postinstall-cli",
    version: "^1.2.2",
    hiddenFromInit: true,
  },
];

export function findTool(id) {
  return TOOLS.find((tool) => tool.id === id);
}

/**
 * Parses a comma-separated tools flag into valid tool ids.
 * Unknown ids are ignored; empty / missing input yields [].
 */
export function parseToolsFlag(value) {
  if (value == null || value === true) return [];

  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((id) => Boolean(findTool(id)));
}
