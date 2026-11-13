import { getPreviousPrice } from "@/features/cart/helpers/price"
import type { Cart, CartTotals } from "@/features/cart/schemas/cart.schema"

const toCents = (value: number) => Math.round(value * 100)

/**
 * The summary's figures for the selected lines, added up in cents so they never drift. DummyJSON
 * sends none for the cart, so the api functions use this; a real API sends its own, since the
 * server decides prices, coupons and rounding.
 */
export function getCartTotals({ items, coupon }: Omit<Cart, "totals">): CartTotals {
  let quantity = 0
  let sale = 0
  let list = 0
  for (const item of items) {
    if (!item.selected) continue
    quantity += item.quantity
    sale += toCents(item.total)
    list += toCents(getPreviousPrice(item.price, item.discountPercentage)) * item.quantity
  }
  const off = coupon ? Math.round((sale * coupon.percent) / 100) : 0

  return {
    quantity,
    subtotal: list / 100,
    productDiscount: (list - sale) / 100,
    couponDiscount: off / 100,
    total: (sale - off) / 100
  }
}

/** The cart with its totals, as the UI reads it. With your API, map the totals it sends instead. */
export function withTotals(cart: Omit<Cart, "totals">): Cart {
  return { ...cart, totals: getCartTotals(cart) }
}
