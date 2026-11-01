import { describe, expect, it } from "vitest";
import { runCommand } from "./exec.js";

function runNode(script) {
  return runCommand(process.execPath, ["-e", script]);
}

describe("runCommand", () => {
  it("resolves when the command succeeds", async () => {
    await expect(runNode("console.log('fine')")).resolves.toBeUndefined();
  });

  it("puts the reason in the error when the command fails", async () => {
    const error = await runNode("console.error('\\u001b[31mUnexpected store\\u001b[39m'); process.exit(3)").catch(
      (reason) => reason,
    );

    expect(error.message).toContain("exited with code 3");
    expect(error.message).toContain("Unexpected store");
    expect(error.message).not.toContain("\u001b");
  });

  it("keeps only the last lines of a long output", async () => {
    const error = await runNode("for (let i = 1; i <= 100; i++) console.log('line ' + i); process.exit(1)").catch(
      (reason) => reason,
    );

    expect(error.message).toContain("line 100");
    expect(error.message).not.toContain("line 80\n");
  });
});
