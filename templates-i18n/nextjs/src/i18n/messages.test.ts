import { describe, expect, it } from "vitest"

import en from "@/messages/en.json"
import tr from "@/messages/tr.json"

function keysOf(messages: object, prefix = ""): string[] {
  return Object.entries(messages)
    .flatMap(([key, value]) =>
      typeof value === "object" && value !== null
        ? keysOf(value, `${prefix}${key}.`)
        : `${prefix}${key}`
    )
    .sort()
}

describe("messages", () => {
  it("has the same keys in every locale", () => {
    expect(keysOf(tr)).toEqual(keysOf(en))
  })
})
