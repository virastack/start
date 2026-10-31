import { Skeleton } from "@/components/ui/skeleton"

/** Route-level pending UI (TanStack equivalent of Next.js `loading.tsx`). */
export function Pending() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-6 py-24">
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="mt-6 h-40 w-full" />
    </div>
  )
}
