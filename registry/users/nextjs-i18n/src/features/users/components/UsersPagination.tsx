import { cn } from "cn"
import { useTranslations } from "next-intl"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"

type UsersPaginationProps = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

const DISABLED_LINK = "pointer-events-none opacity-50"

export function UsersPagination({ page, totalPages, total, onPageChange }: UsersPaginationProps) {
  const t = useTranslations("Users")
  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <Pagination aria-label={t("pagination_label")}>
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationPrevious
            href={`?page=${page - 1}`}
            text={t("previous")}
            aria-label={t("previous")}
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            className={cn(isFirst && DISABLED_LINK)}
            onClick={(event) => {
              event.preventDefault()
              if (!isFirst) onPageChange(page - 1)
            }}
          />
        </PaginationItem>
        <PaginationItem className="text-sm text-muted-foreground">
          <p aria-live="polite" className="text-center tabular-nums">
            {t("page_status", { page, totalPages })}
            <span className="hidden sm:inline"> · {t("total_users", { total })}</span>
          </p>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={`?page=${page + 1}`}
            text={t("next")}
            aria-label={t("next")}
            aria-disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
            className={cn(isLast && DISABLED_LINK)}
            onClick={(event) => {
              event.preventDefault()
              if (!isLast) onPageChange(page + 1)
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
