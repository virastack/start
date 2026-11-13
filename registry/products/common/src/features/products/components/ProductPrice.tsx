import { formatPrice, getDiscountLabel, getPreviousPrice } from "@/features/products/helpers/price"

type ProductPriceProps = {
  price: number
  discountPercentage: number
}

/**
 * `price` is the current price, the one the list sorts by; with a discount, the price before it
 * is struck through. Screen readers hear one sentence instead of two loose numbers.
 */
export function ProductPrice({ price, discountPercentage }: ProductPriceProps) {
  const hasDiscount = getDiscountLabel(discountPercentage) !== null
  const sale = formatPrice(price)
  const list = formatPrice(getPreviousPrice(price, discountPercentage))

  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="sr-only">
        {hasDiscount ? `Sale price ${sale}, was ${list}` : `Price ${sale}`}
      </span>
      <span aria-hidden className="text-base font-semibold tabular-nums">
        {sale}
      </span>
      {hasDiscount && (
        <s aria-hidden className="text-xs text-muted-foreground tabular-nums">
          {list}
        </s>
      )}
    </p>
  )
}
