import { promises as fs } from "node:fs";
import path from "node:path";
import { findTool } from "./tools.js";
import { toPackageName } from "./validate-project-name.js";

/**
 * Rewrites the scaffolded package.json: gives it the user's project name
 * and adds a dependency entry for every selected "dependency"-kind tool
 * (e.g. @virastack/mask). Tools with an "init" CLI (like @virastack/ai)
 * are handled separately since they aren't a runtime dependency.
 */
export async function updatePackageJson(targetDir, { projectName, tools }) {
  const pkgPath = path.join(targetDir, "package.json");

  let pkg;
  try {
    pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
  } catch {
    return;
  }

  pkg.name = toPackageName(projectName);
  pkg.version = "0.1.0";
  delete pkg.author;
  delete pkg.repository;
  delete pkg.bugs;
  delete pkg.homepage;
  delete pkg.keywords;

  pkg.dependencies = pkg.dependencies ?? {};
  for (const toolId of tools) {
    const tool = findTool(toolId);
    if (tool?.kind === "dependency") {
      pkg.dependencies[tool.package] = "^1.0.0";
    }
  }

  await fs.writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}
