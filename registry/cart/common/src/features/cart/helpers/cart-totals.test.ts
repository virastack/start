import { describe, expect, it } from "vitest"

import { getCartTotals, withTotals } from "@/features/cart/helpers/cart-totals"
import type { Cart, CartItem } from "@/features/cart/schemas/cart.schema"

const frock: CartItem = {
  id: 162,
  title: "Blue Frock",
  price: 29.99,
  quantity: 2,
  total: 59.98,
  discountPercentage: 12.13,
  thumbnail: "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp",
  selected: true,
  maxQuantity: 10
}

const ball: CartItem = {
  id: 138,
  title: "Baseball Ball",
  price: 8.99,
  quantity: 1,
  total: 8.99,
  discountPercentage: 1.71,
  thumbnail:
    "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/thumbnail.webp",
  selected: true,
  maxQuantity: 10
}

const cartOf = (items: CartItem[], coupon: Cart["coupon"] = null) => ({ id: 1, items, coupon })

describe("getCartTotals", () => {
  it("adds the lines up in whole cents", () => {
    expect(getCartTotals(cartOf([frock, ball]))).toEqual({
      quantity: 3,
      subtotal: 77.41,
      productDiscount: 8.44,
      couponDiscount: 0,
      total: 68.97
    })
  })

  it("takes the coupon off the current prices, rounded to a cent", () => {
    const totals = getCartTotals(cartOf([frock, ball], { code: "WELCOME10", percent: 10 }))

    expect(totals.couponDiscount).toBe(6.9)
    expect(totals.total).toBe(62.07)
  })

  it("leaves out the lines that are not selected", () => {
    const totals = getCartTotals(cartOf([frock, { ...ball, selected: false }]))

    expect(totals.quantity).toBe(2)
    expect(totals.total).toBe(59.98)
  })

  it("never drifts on prices binary floats cannot hold", () => {
    const items = [{ ...ball, price: 0.1, total: 0.3, discountPercentage: 0, quantity: 3 }]

    expect(getCartTotals(cartOf(items)).total).toBe(0.3)
  })
})

describe("withTotals", () => {
  it("gives the cart the figures the UI reads", () => {
    expect(withTotals(cartOf([frock])).totals.total).toBe(59.98)
  })
})
