import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Personalizes the scaffolded README: renames the H1 to the user's project
 * and strips the marketing hero image (assets/ is not copied into projects).
 */
export async function updateReadme(targetDir, projectName) {
  const readmePath = path.join(targetDir, "README.md");

  let content;
  try {
    content = await fs.readFile(readmePath, "utf8");
  } catch {
    return;
  }

  let updated = content.replace(/^#\s+.+$/m, `# ${projectName}`);
  updated = updated.replace(/^!\[.*?\]\(\.\/assets\/.*?\)\n*/m, "");
  updated = updated.replace(/^<br \/>\n*/m, "");

  if (updated === content) return;

  await fs.writeFile(readmePath, updated);
}
