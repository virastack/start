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
  },
  {
    id: "password",
    package: "@virastack/password",
    kind: "dependency",
  },
  {
    id: "ai",
    package: "@virastack/ai",
    kind: "postinstall-cli",
    hiddenFromInit: true,
  },
];

export function findTool(id) {
  return TOOLS.find((tool) => tool.id === id);
}
