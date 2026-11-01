import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import * as m from "@/paraglide/messages.js"

type UsersPaginationProps = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export function UsersPagination({ page, totalPages, total, onPageChange }: UsersPaginationProps) {
  return (
    <nav aria-label={m.users_pagination()} className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon aria-hidden />
        {m.users_previous()}
      </Button>
      <p aria-live="polite" className="text-center text-sm text-muted-foreground tabular-nums">
        {m.users_page_of({ page, totalPages })}
        <span className="hidden sm:inline"> · {m.users_total({ count: total })}</span>
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {m.users_next()}
        <ChevronRightIcon aria-hidden />
      </Button>
    </nav>
  )
}
