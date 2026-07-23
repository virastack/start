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

  let updated = content
    .replace(/<h1\b[^>]*>.*?<\/h1>/is, `<h1 align="center">${projectName}</h1>`)
    .replace(/^#\s+.+$/m, `# ${projectName}`)
    .replace(
      /<p align="center">\s*<img[^>]*src="\.\/assets\/[^"]*"[^>]*\s*\/?>\s*<\/p>\n*/i,
      "",
    )
    .replace(/^!\[.*?\]\(\.\/assets\/.*?\)\n*/m, "");

  if (updated === content) return;

  await fs.writeFile(readmePath, updated);
}
