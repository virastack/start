import { afterEach, describe, expect, it } from "vitest";

import { setLocale, t } from "../i18n.js";
import { findTool, parseToolsFlag, TOOLS } from "./tools.js";

describe("findTool", () => {
  it("resolves known tools", () => {
    expect(findTool("mask")?.package).toBe("@virastack/mask");
    expect(findTool("password")?.package).toBe("@virastack/password");
    expect(findTool("address")?.package).toBe("@virastack/address");
    expect(findTool("missing")).toBeUndefined();
  });
});

describe("parseToolsFlag", () => {
  it("parses comma-separated ids and drops unknowns", () => {
    expect(parseToolsFlag("mask,password")).toEqual(["mask", "password"]);
    expect(parseToolsFlag("mask, unknown ,ai")).toEqual(["mask", "ai"]);
    expect(parseToolsFlag("address,mask")).toEqual(["address", "mask"]);
  });

  it("returns an empty list for empty input", () => {
    expect(parseToolsFlag(undefined)).toEqual([]);
    expect(parseToolsFlag(true)).toEqual([]);
    expect(parseToolsFlag("")).toEqual([]);
  });
});

describe("tool prompt copy", () => {
  afterEach(() => setLocale("en"));

  it("has a label and a hint for every tool offered in init, in both languages", () => {
    for (const locale of ["en", "tr"]) {
      setLocale(locale);
      for (const tool of TOOLS.filter((item) => !item.hiddenFromInit)) {
        expect(t(`tools.${tool.id}.label`)).toBe(tool.package);
        expect(t(`tools.${tool.id}.hint`)).not.toBe(`tools.${tool.id}.hint`);
      }
    }
  });

  it("offers address in init", () => {
    expect(TOOLS.filter((tool) => !tool.hiddenFromInit).map((tool) => tool.id)).toEqual([
      "mask",
      "password",
      "address",
    ]);
  });
});
