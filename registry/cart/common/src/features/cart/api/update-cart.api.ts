import { api } from "@/lib/api"

import { CART_PATH } from "@/features/cart/constants/cart.constants"
import { withTotals } from "@/features/cart/helpers/cart-totals"
import { cartResponseSchema } from "@/features/cart/schemas/cart.schema"
import type { Cart } from "@/features/cart/schemas/cart.schema"

/**
 * Sends every line, so a line left out is removed. DummyJSON keeps no change and applies each
 * request to its first cart: with `merge: true` and only the changed line, the answer would bring
 * the earlier changes back.
 */
export async function updateCart(cart: Cart): Promise<Cart> {
  const products = cart.items.map(({ id, quantity }) => ({ id, quantity }))
  const updated = await api.put(
    CART_PATH,
    { merge: false, products },
    { schema: cartResponseSchema }
  )
  // DummyJSON keeps neither coupons nor the selection, so both stay as they were; an empty cart
  // drops the coupon. Your API answers with the cart, its coupon, its selection and its totals.
  const selected = new Map(cart.items.map((item) => [item.id, item.selected]))
  return withTotals({
    ...updated,
    items: updated.items.map((item) => ({ ...item, selected: selected.get(item.id) ?? true })),
    coupon: updated.items.length > 0 ? cart.coupon : null
  })
}
