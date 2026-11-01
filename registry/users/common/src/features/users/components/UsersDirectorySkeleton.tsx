import { Skeleton } from "@/components/ui/skeleton"
import { UsersTableSkeleton } from "@/features/users/components/UsersTableSkeleton"

export function UsersDirectorySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-9 w-full" />
      <UsersTableSkeleton />
    </div>
  )
}
