import { StarIcon } from "lucide-react"

export function ProductRating({ rating }: { rating: number }) {
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <StarIcon aria-hidden className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="sr-only">Rated</span>
      <span className="tabular-nums">{rating.toFixed(1)}</span>
      <span className="sr-only">out of 5</span>
    </p>
  )
}
