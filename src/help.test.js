import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const CLI = fileURLToPath(new URL("../bin/virastack.js", import.meta.url));
let registry;

function help(args = []) {
  // Plain text, so the assertions hold where CI forces colors on.
  const env = { ...process.env, VIRASTACK_REGISTRY_URL: registry, NO_COLOR: "1", FORCE_COLOR: "" };
  return spawnSync(process.execPath, [CLI, "--help", ...args], { env, encoding: "utf8" }).stdout;
}

afterEach(() => rmSync(registry, { recursive: true, force: true }));

describe("--help", () => {
  it("lists the modules the registry offers now", () => {
    registry = mkdtempSync(path.join(os.tmpdir(), "virastack-help-"));
    const items = ["users-nextjs", "users-tanstack", "checkout-card-nextjs"].map((name) => ({ name }));
    writeFileSync(path.join(registry, "registry.json"), JSON.stringify({ items }));
    expect(help()).toContain("Modules:\n  users, checkout-card\n");
    expect(help(["--tr"])).toContain("Modüller:\n  users, checkout-card\n");
  });

  it("points at the catalog when the registry cannot be read", () => {
    registry = path.join(os.tmpdir(), "virastack-help-missing");
    expect(help()).toContain("Modules:\n  https://virastack.com/start/features\n");
  });
});
