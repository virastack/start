import { PRODUCT_CURRENCY } from "@/features/products/constants/products.constants"

const priceFormat = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: PRODUCT_CURRENCY
})

export function formatPrice(value: number) {
  return priceFormat.format(value)
}

/**
 * DummyJSON's `price` is what the product costs now, and the one the list sorts by, so it is the
 * price the reader sees. The price before the discount comes from it, rounded to whole cents.
 */
export function getPreviousPrice(price: number, discountPercentage: number) {
  if (discountPercentage <= 0 || discountPercentage >= 100) return price
  return Math.round((price * 10000) / (100 - discountPercentage)) / 100
}

/** The whole percent a card shows; under 1% it shows none. */
export function getDiscountPercent(discountPercentage: number) {
  const percent = Math.round(discountPercentage)
  return percent >= 1 ? percent : null
}

export function getDiscountLabel(discountPercentage: number) {
  const percent = getDiscountPercent(discountPercentage)
  return percent === null ? null : `-${percent}%`
}
