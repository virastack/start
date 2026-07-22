import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Seeds a working .env.local from .env.example so `npm run dev` works
 * immediately after scaffold. Skips if .env.local already exists.
 */
export async function setupEnvFile(targetDir) {
  const examplePath = path.join(targetDir, ".env.example");
  const localPath = path.join(targetDir, ".env.local");

  try {
    await fs.access(examplePath);
  } catch {
    return false;
  }

  try {
    await fs.access(localPath);
    return false;
  } catch {
    await fs.copyFile(examplePath, localPath);
    return true;
  }
}
