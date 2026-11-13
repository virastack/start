import { useTranslations } from "next-intl"

import { Skeleton } from "@/components/ui/skeleton"

export function CartSkeleton() {
  const t = useTranslations("Cart")

  return (
    <div role="status" aria-label={t("loading")}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col divide-y rounded-lg border px-4">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex gap-3 py-4 sm:gap-4">
              <Skeleton className="size-20 shrink-0 sm:size-24" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="mt-1 h-9 w-28" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="hidden h-80 w-full rounded-lg md:block" />
      </div>
    </div>
  )
}
