import { promises as fs } from "node:fs";
import path from "node:path";

const BEGIN = "<!-- BEGIN:nextjs-agent-rules -->";

/**
 * The block Next.js 16.2+ documents for AGENTS.md
 * (node_modules/next/dist/docs/01-app/02-guides/ai-agents.md): it points
 * agents at the docs bundled with the installed `next` version. Written
 * directly instead of running `@next/codemod agents-md`, which only targets
 * Next.js 16.1 and earlier.
 */
export const NEXT_AGENTS_BLOCK = `${BEGIN}

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in \`node_modules/next/dist/docs/\`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
`;

/**
 * Adds the Next.js block to AGENTS.md. An existing file keeps its content and
 * gets the block appended; a file that already has the block is left alone.
 * Returns whether the file changed.
 */
export async function writeNextAgentsBlock(targetDir) {
  const file = path.join(targetDir, "AGENTS.md");
  let current = null;
  try {
    current = await fs.readFile(file, "utf8");
  } catch {
    // No AGENTS.md yet.
  }

  if (current?.includes(BEGIN)) return false;
  const content = current ? `${current.replace(/\s*$/, "")}\n\n${NEXT_AGENTS_BLOCK}` : NEXT_AGENTS_BLOCK;
  await fs.writeFile(file, content);
  return true;
}
