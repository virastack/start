import { CART_CURRENCY } from "@/features/cart/constants/cart.constants"

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CART_CURRENCY
})

export function formatPrice(value: number) {
  return priceFormat.format(value)
}

/**
 * A line's `price` is what the product costs now, the price its own page shows. The price before
 * the discount comes from it, rounded to whole cents.
 */
export function getPreviousPrice(price: number, discountPercentage: number) {
  if (discountPercentage <= 0 || discountPercentage >= 100) return price
  return Math.round((price * 10000) / (100 - discountPercentage)) / 100
}
