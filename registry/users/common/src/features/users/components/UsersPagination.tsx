import type { ReactNode } from "react"

import { cn } from "cn"

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
  /** Shown after the page summary. */
  children?: ReactNode
}

const DISABLED_LINK = "pointer-events-none opacity-50"

export function UsersPagination({
  page,
  totalPages,
  total,
  onPageChange,
  children
}: UsersPaginationProps) {
  const isFirst = page <= 1
  const isLast = page >= totalPages

  return (
    <Pagination aria-label="Pagination">
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationPrevious
            href={`?page=${page - 1}`}
            text="Previous"
            aria-label="Previous"
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            className={cn(isFirst && DISABLED_LINK)}
            onClick={(event) => {
              event.preventDefault()
              if (!isFirst) onPageChange(page - 1)
            }}
          />
        </PaginationItem>
        <PaginationItem className="flex flex-col items-center gap-x-2 gap-y-1 text-sm text-muted-foreground sm:flex-row">
          <p aria-live="polite" className="text-center tabular-nums">
            Page {page} of {totalPages}
            <span className="hidden sm:inline"> · {total} users</span>
          </p>
          {children ? (
            <>
              <span aria-hidden className="hidden sm:inline">
                ·
              </span>
              {children}
            </>
          ) : null}
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={`?page=${page + 1}`}
            text="Next"
            aria-label="Next"
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
