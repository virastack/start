import { describe, expect, it } from "vitest"

import { formatPrice, getDiscountLabel, getPreviousPrice } from "@/features/products/helpers/price"

describe("price helpers", () => {
  it("works the price before the discount out from the current one, in whole cents", () => {
    expect(getPreviousPrice(9, 10)).toBe(10)
    expect(getPreviousPrice(8.94, 10.48)).toBe(9.99)
    expect(getPreviousPrice(100, 0)).toBe(100)
  })

  it("rounds the discount and hides one under 1%", () => {
    expect(getDiscountLabel(10.48)).toBe("-10%")
    expect(getDiscountLabel(0.4)).toBeNull()
  })

  it("formats dollars", () => {
    expect(formatPrice(1099.9)).toBe("$1,099.90")
  })
})
