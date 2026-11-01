"use client"

import { StarIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { useFavoriteIds } from "@/features/users/hooks/use-favorite-ids"

export function FavoritesCount() {
  const t = useTranslations("Users")
  const count = useFavoriteIds().length

  return (
    <p aria-live="polite" className="flex items-center gap-1.5 text-sm whitespace-nowrap">
      <StarIcon aria-hidden className="size-4 fill-current" />
      {t.rich("favorites_count", {
        count,
        number: (chunks) => <span className="tabular-nums">{chunks}</span>
      })}
    </p>
  )
}
