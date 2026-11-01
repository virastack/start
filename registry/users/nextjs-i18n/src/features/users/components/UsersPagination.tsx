import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type UsersPaginationProps = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export function UsersPagination({ page, totalPages, total, onPageChange }: UsersPaginationProps) {
  const t = useTranslations("Users")

  return (
    <nav aria-label={t("pagination_label")} className="flex items-center justify-between gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon aria-hidden />
        {t("previous")}
      </Button>
      <p aria-live="polite" className="text-center text-sm text-muted-foreground tabular-nums">
        {t("page_status", { page, totalPages })}
        <span className="hidden sm:inline"> · {t("total_users", { total })}</span>
      </p>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {t("next")}
        <ChevronRightIcon aria-hidden />
      </Button>
    </nav>
  )
}
