import { Skeleton } from "@/components/ui/skeleton"
import { USERS_PAGE_SIZE } from "@/features/users/constants/users.constants"
import * as m from "@/paraglide/messages.js"

const ROWS = Array.from({ length: USERS_PAGE_SIZE }, (_, index) => index)

export function UsersTableSkeleton() {
  return (
    <div role="status" aria-label={m.users_loading()} className="flex flex-col gap-4">
      <div className="rounded-lg border">
        <Skeleton className="m-3 h-5 w-24" />
        {ROWS.map((row) => (
          <div key={row} className="flex h-14.5 items-center gap-3 border-t px-4">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto size-6 shrink-0" />
          </div>
        ))}
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  )
}
