import { describe, expect, it } from "vitest";

import { shouldIgnore } from "./copy-template.js";

describe("shouldIgnore", () => {
  it("ignores build artifacts and lockfiles", () => {
    expect(shouldIgnore(".next")).toBe(true);
    expect(shouldIgnore("node_modules")).toBe(true);
    expect(shouldIgnore("pnpm-lock.yaml")).toBe(true);
    expect(shouldIgnore("coverage")).toBe(true);
  });

  it("keeps .env.example but ignores other env files", () => {
    expect(shouldIgnore(".env.example")).toBe(false);
    expect(shouldIgnore(".env")).toBe(true);
    expect(shouldIgnore(".env.local")).toBe(true);
  });

  it("keeps normal source files", () => {
    expect(shouldIgnore("package.json")).toBe(false);
    expect(shouldIgnore("src")).toBe(false);
  });
});
