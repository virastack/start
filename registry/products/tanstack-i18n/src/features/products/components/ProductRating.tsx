import { StarIcon } from "lucide-react"

import { useProductFormat } from "@/features/products/hooks/use-product-format"
import * as m from "@/paraglide/messages"

export function ProductRating({ rating }: { rating: number }) {
  const format = useProductFormat()
  const value = format.rating(rating)

  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <StarIcon aria-hidden className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="sr-only">{m.products_rating({ rating: value })}</span>
      <span aria-hidden className="tabular-nums">
        {value}
      </span>
    </p>
  )
}
