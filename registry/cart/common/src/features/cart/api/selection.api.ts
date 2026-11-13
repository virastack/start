import { withTotals } from "@/features/cart/helpers/cart-totals"
import type { Cart } from "@/features/cart/schemas/cart.schema"

/**
 * No request yet: DummyJSON keeps no selection. Replace the body with a request to your API, which
 * stores which lines go to checkout and answers with the cart. To keep the selection in this
 * browser instead, leave it as it is and keep `staleTime: Infinity` in `cart.queries.ts`: a new
 * fetch would select every line again.
 */
export async function selectCartItems(
  cart: Cart,
  itemIds: number[],
  selected: boolean
): Promise<Cart> {
  const wanted = new Set(itemIds)
  return withTotals({
    ...cart,
    items: cart.items.map((item) => (wanted.has(item.id) ? { ...item, selected } : item))
  })
}
