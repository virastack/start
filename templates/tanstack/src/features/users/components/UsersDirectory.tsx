"use client"

import { SearchIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { UsersMessage } from "@/features/users/components/UsersMessage"
import { UsersPagination } from "@/features/users/components/UsersPagination"
import { UsersTable } from "@/features/users/components/UsersTable"
import { UsersTableSkeleton } from "@/features/users/components/UsersTableSkeleton"
import { USERS_PAGE_SIZE } from "@/features/users/constants/users.constants"
import { getErrorMessage } from "@/features/users/helpers/get-error-message"
import { useUsers } from "@/features/users/hooks/use-users"
import { useUsersParams } from "@/features/users/hooks/use-users-params"

export function UsersDirectory() {
  const { page, q, debouncedQ, setPage, setSearch, clearSearch } = useUsersParams()
  const users = useUsers({ page, q: debouncedQ })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="users-search" className="sr-only">
            Search users
          </Label>
          <SearchIcon
            aria-hidden
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="users-search"
            type="search"
            placeholder="Search users"
            className="pl-9"
            value={q}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <AddUserDialog />
      </div>

      {users.isPending ? (
        <UsersTableSkeleton />
      ) : users.isError ? (
        <UsersMessage
          role="alert"
          title="Could not load users"
          description={getErrorMessage(users.error)}
          action={
            <Button variant="outline" disabled={users.isFetching} onClick={() => users.refetch()}>
              {users.isFetching ? "Retrying…" : "Retry"}
            </Button>
          }
        />
      ) : users.data.users.length === 0 ? (
        users.data.total > 0 ? (
          <UsersMessage
            title="This page is empty"
            description={`The results end before page ${page}.`}
            action={
              <Button variant="outline" onClick={() => setPage(1)}>
                Go to the first page
              </Button>
            }
          />
        ) : debouncedQ.trim() ? (
          <UsersMessage
            title="No users found"
            description={`Nothing matches “${debouncedQ.trim()}”.`}
            action={
              <Button variant="outline" onClick={() => clearSearch()}>
                Clear search
              </Button>
            }
          />
        ) : (
          <UsersMessage title="No users yet" description="The API returned an empty list." />
        )
      ) : (
        <div
          aria-busy={users.isPlaceholderData}
          className={cn("flex flex-col gap-4", users.isPlaceholderData && "opacity-60")}
        >
          <UsersTable users={users.data.users} />
          <UsersPagination
            page={page}
            total={users.data.total}
            totalPages={Math.ceil(users.data.total / USERS_PAGE_SIZE)}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
