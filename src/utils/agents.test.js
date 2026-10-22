import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatAgents,
  getAiInitArgs,
  getAiPackageSpec,
  getSkillArgs,
  getSkillsCommand,
  parseAgentFlag,
} from "./agents.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("parseAgentFlag", () => {
  it("parses tools in canonical order", () => {
    expect(parseAgentFlag("claude,cursor")).toEqual(["claude", "cursor"]);
    expect(parseAgentFlag("cursor, claude")).toEqual(["claude", "cursor"]);
    expect(parseAgentFlag("cursor")).toEqual(["cursor"]);
  });

  it("accepts none", () => {
    expect(parseAgentFlag("none")).toEqual([]);
  });

  it("rejects unknown, mixed or missing values", () => {
    expect(parseAgentFlag("copilot")).toBeNull();
    expect(parseAgentFlag("claude,none")).toBeNull();
    expect(parseAgentFlag("")).toBeNull();
    expect(parseAgentFlag(true)).toBeNull();
  });
});

describe("@virastack/ai command", () => {
  it("uses the next channel for a prerelease CLI and v2 otherwise", () => {
    expect(getAiPackageSpec("1.1.0-beta.1")).toBe("@virastack/ai@next");
    expect(getAiPackageSpec("1.1.0")).toBe("@virastack/ai@2");
  });

  it("can be pointed at another package spec", () => {
    vi.stubEnv("VIRASTACK_AI_SPEC", "/tmp/virastack-ai.tgz");
    expect(getAiPackageSpec("1.1.0")).toBe("/tmp/virastack-ai.tgz");
  });

  it("passes the agents and never --force", () => {
    const args = getAiInitArgs(["claude", "cursor"], { tr: true });
    expect(args.slice(2)).toEqual(["init", "--agent", "claude,cursor", "--yes", "--tr"]);
    expect(getAiInitArgs([])).toContain("none");
    expect(getAiInitArgs(undefined)).not.toContain("--agent");
    expect(args).not.toContain("--force");
  });

  it("formats none", () => {
    expect(formatAgents([])).toBe("none");
  });
});

describe("skills", () => {
  it("installs only for the selected agents, as copies", () => {
    const args = getSkillArgs({ source: "emilkowalski/skills", skill: "emil-design-eng" }, ["cursor"]);
    expect(args).toEqual([
      "--yes", "skills@latest", "add", "emilkowalski/skills",
      "--skill", "emil-design-eng", "-a", "universal", "-a", "cursor", "--copy", "-y",
    ]);
    expect(getSkillArgs({ source: "a/b" }, ["claude", "cursor"])).toEqual(
      expect.arrayContaining(["-a", "claude-code", "cursor"]),
    );
  });

  it("installs to .agents/skills unless Claude Code is the only tool", () => {
    const args = getSkillArgs({ source: "jakubkrehel/skills", skill: "better-ui" }, []);
    expect(args.slice(4)).toEqual(["--skill", "better-ui", "-a", "universal", "--copy", "-y"]);
    expect(getSkillArgs({ source: "a/b" }, ["claude", "cursor"])).toContain("universal");
  });

  it("skips .agents/skills when Claude Code is the only tool", () => {
    const args = getSkillArgs({ source: "jakubkrehel/skills", skill: "better-ui" }, ["claude"]);
    expect(args.slice(4)).toEqual(["--skill", "better-ui", "-a", "claude-code", "--copy", "-y"]);
  });

  it("prints an interactive manual command", () => {
    expect(getSkillsCommand()).toBe(
      "npx skills@latest add emilkowalski/skills --skill emil-design-eng && npx skills@latest add jakubkrehel/skills --skill better-ui && npx skills@latest add jakubkrehel/skills --skill better-accessibility",
    );
  });
});
