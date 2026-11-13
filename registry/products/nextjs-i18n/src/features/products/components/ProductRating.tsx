import { StarIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { useProductFormat } from "@/features/products/hooks/use-product-format"

export function ProductRating({ rating }: { rating: number }) {
  const t = useTranslations("Products")
  const format = useProductFormat()
  const value = format.rating(rating)

  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <StarIcon aria-hidden className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="sr-only">{t("rating", { rating: value })}</span>
      <span aria-hidden className="tabular-nums">
        {value}
      </span>
    </p>
  )
}
