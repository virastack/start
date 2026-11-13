import { z } from "zod"

import { MAX_QUANTITY } from "@/features/cart/constants/cart.constants"

const cartItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  /** What one costs now, as on the product's page; the price before the discount comes from it. */
  price: z.number(),
  quantity: z.number().int().positive(),
  /** What the line costs in all: DummyJSON's `total`, the current price times the quantity. */
  total: z.number(),
  discountPercentage: z.number().default(0),
  thumbnail: z.url(),
  /**
   * Whether the line goes to checkout. DummyJSON has no such field, so every line starts selected;
   * an API that keeps the selection sends it here.
   */
  selected: z.boolean().default(true),
  /** The most of this product the stepper allows: your API's stock for the line. */
  maxQuantity: z.number().int().positive().default(MAX_QUANTITY)
})

/**
 * DummyJSON's cart, the same from GET and PUT. Only the lines are read: PUT rounds the cart's
 * totals to whole dollars, so `withTotals` works them out in the api functions. With your API,
 * read its totals there instead.
 */
export const cartResponseSchema = z
  .object({ id: z.number(), products: z.array(cartItemSchema) })
  .transform(({ id, products }) => ({ id, items: products }))

export type CartItem = z.infer<typeof cartItemSchema>

export type Coupon = {
  code: string
  /** Off the products' current prices. */
  percent: number
}

/** The summary's figures, for the selected lines: the ones checkout gets. */
export type CartTotals = {
  quantity: number
  subtotal: number
  productDiscount: number
  couponDiscount: number
  total: number
}

/** The cart as the UI reads it. Every api function answers with all of it, totals included. */
export type Cart = {
  id: number
  items: CartItem[]
  /** The applied coupon, which comes with the cart, as a real API would send it. */
  coupon: Coupon | null
  totals: CartTotals
}
