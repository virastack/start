import { api } from "@/lib/api"

import { CART_PATH } from "@/features/cart/constants/cart.constants"
import { withTotals } from "@/features/cart/helpers/cart-totals"
import { cartResponseSchema } from "@/features/cart/schemas/cart.schema"
import type { Cart } from "@/features/cart/schemas/cart.schema"

export async function getCart(signal?: AbortSignal): Promise<Cart> {
  const cart = await api.get(CART_PATH, { schema: cartResponseSchema, signal })
  // DummyJSON has no coupons and no cart totals. Your API sends both with the cart.
  return withTotals({ ...cart, coupon: null })
}
