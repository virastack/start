import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Replaces the first markdown H1 in the scaffolded README with the user's
 * project name so the generated project doesn't keep the template title.
 */
export async function updateReadme(targetDir, projectName) {
  const readmePath = path.join(targetDir, "README.md");

  let content;
  try {
    content = await fs.readFile(readmePath, "utf8");
  } catch {
    return;
  }

  const updated = content.replace(/^#\s+.+$/m, `# ${projectName}`);
  if (updated === content) return;

  await fs.writeFile(readmePath, updated);
}
