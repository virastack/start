import { describe, expect, it } from "vitest";

import { getFlag, hasFlag, parseArgs } from "./args.js";

describe("parseArgs", () => {
  it("splits positionals and boolean flags", () => {
    const { positionals, flags } = parseArgs(["node", "virastack", "init", "my-app", "--yes", "-y"]);
    expect(positionals).toEqual(["init", "my-app"]);
    expect(hasFlag(flags, "yes", "y")).toBe(true);
  });

  it("parses --key=value and --key value", () => {
    const eq = parseArgs(["node", "virastack", "--template=nextjs", "--name", "demo"]);
    expect(getFlag(eq.flags, "template")).toBe("nextjs");
    expect(getFlag(eq.flags, "name")).toBe("demo");
  });

  it("reads --agent as a value flag", () => {
    expect(getFlag(parseArgs(["node", "virastack", "--agent", "claude,cursor", "app"]).flags, "agent")).toBe("claude,cursor");
    expect(getFlag(parseArgs(["node", "virastack", "--agent=none"]).flags, "agent")).toBe("none");
    expect(getFlag(parseArgs(["node", "virastack", "--agent", "--yes"]).flags, "agent")).toBe(true);
  });

  it("expands short flag clusters", () => {
    const { flags } = parseArgs(["node", "virastack", "-yh"]);
    expect(hasFlag(flags, "y")).toBe(true);
    expect(hasFlag(flags, "h")).toBe(true);
  });
});
