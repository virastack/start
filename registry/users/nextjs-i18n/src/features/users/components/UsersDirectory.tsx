"use client"

import { SearchIcon } from "lucide-react"
import { cn } from "cn"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AddUserDialog } from "@/features/users/components/AddUserDialog"
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
        <Empty role="alert" className="border">
          <EmptyHeader>
            <EmptyTitle>{t("load_error_title")}</EmptyTitle>
            <EmptyDescription>{getErrorMessage(users.error)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" disabled={users.isFetching} onClick={() => users.refetch()}>
              {users.isFetching ? t("retrying") : t("retry")}
            </Button>
          </EmptyContent>
        </Empty>
      ) : users.data.users.length === 0 ? (
        users.data.total > 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>{t("empty_page_title")}</EmptyTitle>
              <EmptyDescription>{t("empty_page_description", { page })}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => setPage(1)}>
                {t("go_to_first_page")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : debouncedQ.trim() ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>{t("no_results_title")}</EmptyTitle>
              <EmptyDescription>
                {t("no_results_description", { query: debouncedQ.trim() })}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => clearSearch()}>
                {t("clear_search")}
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>{t("no_users_title")}</EmptyTitle>
              <EmptyDescription>{t("no_users_description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
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
