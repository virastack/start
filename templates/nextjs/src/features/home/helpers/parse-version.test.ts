import { describe, expect, it } from "vitest"

import { parseVersion } from "@/features/home/helpers/parse-version"

describe("parseVersion", () => {
  it.each([
    ["^5.105.0", "5.105"],
    ["~16.4.3", "16.4"],
    ["1.0.0", "1.0"],
    ["npm:@typescript/typescript6@^6.0.2", "6.0"]
  ])("reads %s as %s", (range, version) => {
    expect(parseVersion(range)).toBe(version)
  })

  it("returns a range it cannot read as it is", () => {
    expect(parseVersion("latest")).toBe("latest")
  })
})
