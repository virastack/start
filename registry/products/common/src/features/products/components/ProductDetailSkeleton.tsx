import { Skeleton } from "@/components/ui/skeleton"

/** The detail page's shape while the product loads. */
export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading product" className="@container flex flex-col gap-6">
      <Skeleton className="h-5 w-28" />
      <div className="grid gap-6 @3xl:grid-cols-2 @3xl:gap-10">
        <Skeleton className="aspect-square rounded-xl" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-28" />
          <ProductTextSkeleton />
        </div>
      </div>
    </div>
  )
}

/** The description's place, while only the card's fields are known. */
export function ProductTextSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
