import { DUMMY_COUPONS } from "@/features/cart/constants/cart.constants"
import { withTotals } from "@/features/cart/helpers/cart-totals"
import type { Cart } from "@/features/cart/schemas/cart.schema"

/** Why a code was turned down, for the form to word. Add the reasons your API sends. */
type CouponErrorReason = "invalid"

export class CouponError extends Error {
  constructor(readonly reason: CouponErrorReason) {
    super(`Coupon rejected: ${reason}`)
    this.name = "CouponError"
  }
}

/**
 * No request yet: DummyJSON has no coupons. Replace the body with a request to your API, which
 * checks the code and answers with the cart, the coupon applied.
 */
export async function applyCoupon(cart: Cart, code: string): Promise<Cart> {
  const wanted = code.trim().toUpperCase()
  const coupon = DUMMY_COUPONS.find((candidate) => candidate.code === wanted)
  if (!coupon) throw new CouponError("invalid")
  return withTotals({ ...cart, coupon })
}

/** No request yet: replace the body with a request to your API, which answers with the cart. */
export async function removeCoupon(cart: Cart): Promise<Cart> {
  return withTotals({ ...cart, coupon: null })
}
