import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { applyCoupon, CouponError } from "@/features/cart/api/coupon.api"
import { getCart } from "@/features/cart/api/get-cart.api"
import { updateCart } from "@/features/cart/api/update-cart.api"
import { CART_PATH } from "@/features/cart/constants/cart.constants"
import { withTotals } from "@/features/cart/helpers/cart-totals"
import { server } from "@/test/server"

const CART_URL = `${siteConfig.apiUrl}${CART_PATH}`

/** A line as DummyJSON sends it. */
const frock = {
  id: 162,
  title: "Blue Frock",
  price: 29.99,
  quantity: 2,
  total: 59.98,
  discountPercentage: 12.13,
  thumbnail: "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp"
}

/** The same line as the schema reads it. */
const frockLine = { ...frock, selected: true, maxQuantity: 10 }

const coupon = { code: "WELCOME10", percent: 10 }

describe("getCart", () => {
  it("reads the lines, starts without a coupon and works out the totals", async () => {
    server.use(
      http.get(CART_URL, () =>
        HttpResponse.json({
          id: 1,
          products: [{ ...frock, discountedTotal: 52.7 }],
          total: 59.98,
          discountedTotal: 52.7,
          userId: 1,
          totalProducts: 1,
          totalQuantity: 2
        })
      )
    )

    const cart = await getCart()

    expect(cart).toEqual(withTotals({ id: 1, items: [frockLine], coupon: null }))
    expect(cart.totals.total).toBe(59.98)
  })
})

describe("updateCart", () => {
  function capturePut(products: unknown[]) {
    const captured: { body?: unknown } = {}
    server.use(
      http.put(CART_URL, async ({ request }) => {
        captured.body = await request.json()
        // PUT names a line's discounted total `discountedPrice` and rounds the cart's to dollars.
        return HttpResponse.json({ id: 1, products, total: 89.97, discountedTotal: 79 })
      })
    )
    return captured
  }

  it("sends every line and replaces the cart, so earlier changes stay", async () => {
    const line = { ...frock, quantity: 3, total: 89.97, discountedPrice: 79 }
    const captured = capturePut([line])
    const cart = withTotals({
      id: 1,
      items: [{ ...frockLine, quantity: 3, selected: false }],
      coupon
    })

    const updated = await updateCart(cart)

    expect(captured.body).toEqual({ merge: false, products: [{ id: 162, quantity: 3 }] })
    // DummyJSON drops the selection, so the line keeps its own.
    expect(updated).toEqual(
      withTotals({
        id: 1,
        items: [{ ...frockLine, quantity: 3, total: 89.97, selected: false }],
        coupon
      })
    )
  })

  it("drops the coupon of a cart left empty", async () => {
    capturePut([])

    await expect(updateCart(withTotals({ id: 1, items: [], coupon }))).resolves.toEqual(
      withTotals({ id: 1, items: [], coupon: null })
    )
  })
})

describe("applyCoupon", () => {
  const cart = withTotals({ id: 1, items: [frockLine], coupon: null })

  it("matches a dummy code in any letter case and works out the discount", async () => {
    const applied = await applyCoupon(cart, " welcome10 ")

    expect(applied.coupon).toEqual(coupon)
    expect(applied.totals.couponDiscount).toBe(6)
  })

  it("turns an unknown code down with a reason the form can word", async () => {
    await expect(applyCoupon(cart, "NOPE")).rejects.toEqual(new CouponError("invalid"))
  })
})
