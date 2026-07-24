import { describe, expect, it } from "vitest";

import { toPackageName, validateProjectName } from "./validate-project-name.js";

describe("validateProjectName", () => {
  it("accepts valid npm names and current directory", () => {
    expect(validateProjectName("my-app")).toBeNull();
    expect(validateProjectName("@scope/pkg")).toBeNull();
    expect(validateProjectName(".")).toBeNull();
  });

  it("rejects empty and invalid names", () => {
    expect(validateProjectName("")).toBe("empty");
    expect(validateProjectName("   ")).toBe("empty");
    expect(validateProjectName("My App")).toBe("invalid");
    expect(validateProjectName("UPPER")).toBe("invalid");
  });
});

describe("toPackageName", () => {
  it("sanitizes to a safe package name", () => {
    expect(toPackageName("My Cool App")).toBe("my-cool-app");
    expect(toPackageName("___")).toBe("virastack-app");
  });
});
