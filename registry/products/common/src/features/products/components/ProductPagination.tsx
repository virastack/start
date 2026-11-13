import type { MouseEvent } from "react"

import { cn } from "cn"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"

type ProductPaginationProps = {
  page: number
  totalPages: number
  /** A real link to the page, so it opens without JavaScript and search engines follow it. */
  getPageHref: (page: number) => string
  onPageChange: (page: number) => void
}

const DISABLED_LINK = "pointer-events-none opacity-50"

/** A click that should open a new tab or window instead, which the link must leave alone. */
function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

export function ProductPagination({
  page,
  totalPages,
  getPageHref,
  onPageChange
}: ProductPaginationProps) {
  const isFirst = page <= 1
  const isLast = page >= totalPages
  // The link goes to the page without JavaScript; with it, the list changes in place.
  const go = (event: MouseEvent<HTMLAnchorElement>, target: number, isDisabled: boolean) => {
    if (isModifiedClick(event) && !isDisabled) return
    event.preventDefault()
    if (!isDisabled) onPageChange(target)
  }

  return (
    <Pagination aria-label="Pagination">
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          <PaginationPrevious
            href={isFirst ? undefined : getPageHref(page - 1)}
            text="Previous"
            aria-label="Previous page"
            aria-disabled={isFirst}
            tabIndex={isFirst ? -1 : undefined}
            className={cn(isFirst && DISABLED_LINK)}
            onClick={(event) => go(event, page - 1, isFirst)}
          />
        </PaginationItem>
        <PaginationItem className="text-sm text-muted-foreground">
          <p className="text-center tabular-nums">{`Page ${page} of ${totalPages}`}</p>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={isLast ? undefined : getPageHref(page + 1)}
            text="Next"
            aria-label="Next page"
            aria-disabled={isLast}
            tabIndex={isLast ? -1 : undefined}
            className={cn(isLast && DISABLED_LINK)}
            onClick={(event) => go(event, page + 1, isLast)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
