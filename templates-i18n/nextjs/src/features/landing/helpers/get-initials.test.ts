import { describe, expect, it } from "vitest";

import { getInitials } from "@/features/landing/helpers/get-initials";

describe("getInitials", () => {
  it("uses the first and last name", () => {
    expect(getInitials("Ada King Lovelace")).toBe("AL");
  });

  it("uses one letter for a single name", () => {
    expect(getInitials("  grace ")).toBe("G");
  });

  it("falls back to a question mark for an empty name", () => {
    expect(getInitials("   ")).toBe("?");
  });
});
