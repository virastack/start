import { useTranslations } from "next-intl"

import { getDiscountPercent, getPreviousPrice } from "@/features/products/helpers/price"
import { useProductFormat } from "@/features/products/hooks/use-product-format"

type ProductPriceProps = {
  price: number
  discountPercentage: number
}

/**
 * `price` is the current price, the one the list sorts by; with a discount, the price before it
 * is struck through. Screen readers hear one sentence instead of two loose numbers.
 */
export function ProductPrice({ price, discountPercentage }: ProductPriceProps) {
  const t = useTranslations("Products")
  const format = useProductFormat()
  const hasDiscount = getDiscountPercent(discountPercentage) !== null
  const sale = format.price(price)
  const list = format.price(getPreviousPrice(price, discountPercentage))

  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className="sr-only">
        {hasDiscount ? t("sale_price", { sale, list }) : t("price", { price: sale })}
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
