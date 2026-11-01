"use client"

import { useTranslations } from "next-intl"

import { useFavoriteIds } from "@/features/users/hooks/use-favorite-ids"

export function FavoritesCount() {
  const t = useTranslations("Users")
  const count = useFavoriteIds().length

  return (
    <p aria-live="polite" className="text-sm whitespace-nowrap">
      {t.rich("favorites_count", {
        count,
        number: (chunks) => <span className="tabular-nums">{chunks}</span>
      })}
    </p>
  )
}
