import { useTranslations } from "next-intl"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const SKELETON_CARDS = 8

export function ProductCardSkeleton() {
  return (
    <Card aria-hidden className="gap-0 py-0">
      <Skeleton className="aspect-square rounded-none" />
      <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="mt-2 h-5 w-1/2" />
      </CardContent>
    </Card>
  )
}

/** Uses the grid's column widths as container queries, so it matches the list it stands in for. */
export function ProductGridSkeleton() {
  const t = useTranslations("Products")

  return (
    <div
      role="status"
      aria-label={t("loading_products")}
      className="grid grid-cols-2 gap-3 @xl:grid-cols-3 @xl:gap-4 @3xl:grid-cols-4"
    >
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
