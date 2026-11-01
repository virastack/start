"use client"

import { SearchIcon } from "lucide-react"
import { cn } from "cn"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddUserDialog } from "@/features/users/components/AddUserDialog"
import { UsersMessage } from "@/features/users/components/UsersMessage"
import { UsersPagination } from "@/features/users/components/UsersPagination"
import { UsersTable } from "@/features/users/components/UsersTable"
import { UsersTableSkeleton } from "@/features/users/components/UsersTableSkeleton"
import { USERS_PAGE_SIZE } from "@/features/users/constants/users.constants"
import { useErrorMessage } from "@/features/users/hooks/use-error-message"
import { useUsers } from "@/features/users/hooks/use-users"
import { useUsersParams } from "@/features/users/hooks/use-users-params"

export function UsersDirectory() {
  const t = useTranslations("Users")
  const getErrorMessage = useErrorMessage()
  const { page, q, debouncedQ, setPage, setSearch, clearSearch } = useUsersParams()
  const users = useUsers({ page, q: debouncedQ })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Label htmlFor="users-search" className="sr-only">
            {t("search_label")}
          </Label>
          <SearchIcon
            aria-hidden
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="users-search"
            type="search"
            placeholder={t("search_label")}
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
          title={t("load_error_title")}
          description={getErrorMessage(users.error)}
          action={
            <Button variant="outline" disabled={users.isFetching} onClick={() => users.refetch()}>
              {users.isFetching ? t("retrying") : t("retry")}
            </Button>
          }
        />
      ) : users.data.users.length === 0 ? (
        users.data.total > 0 ? (
          <UsersMessage
            title={t("empty_page_title")}
            description={t("empty_page_description", { page })}
            action={
              <Button variant="outline" onClick={() => setPage(1)}>
                {t("go_to_first_page")}
              </Button>
            }
          />
        ) : debouncedQ.trim() ? (
          <UsersMessage
            title={t("no_results_title")}
            description={t("no_results_description", { query: debouncedQ.trim() })}
            action={
              <Button variant="outline" onClick={() => clearSearch()}>
                {t("clear_search")}
              </Button>
            }
          />
        ) : (
          <UsersMessage title={t("no_users_title")} description={t("no_users_description")} />
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
