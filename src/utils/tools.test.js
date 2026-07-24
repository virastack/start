import { describe, expect, it } from "vitest";

import { findTool, parseToolsFlag } from "./tools.js";

describe("findTool", () => {
  it("resolves known tools", () => {
    expect(findTool("mask")?.package).toBe("@virastack/mask");
    expect(findTool("missing")).toBeUndefined();
  });
});

describe("parseToolsFlag", () => {
  it("parses comma-separated ids and drops unknowns", () => {
    expect(parseToolsFlag("mask,password")).toEqual(["mask", "password"]);
    expect(parseToolsFlag("mask, unknown ,ai")).toEqual(["mask", "ai"]);
  });

  it("returns an empty list for empty input", () => {
    expect(parseToolsFlag(undefined)).toEqual([]);
    expect(parseToolsFlag(true)).toEqual([]);
    expect(parseToolsFlag("")).toEqual([]);
  });
});
