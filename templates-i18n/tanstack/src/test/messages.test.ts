import { describe, expect, it } from "vitest"

import en from "@/messages/en.json"
import tr from "@/messages/tr.json"

describe("messages", () => {
  it("has the same keys in every locale", () => {
    expect(Object.keys(tr).sort()).toEqual(Object.keys(en).sort())
  })
})
