"use client"

import { StarIcon } from "lucide-react"

import { useFavoriteIds } from "@/features/users/hooks/use-favorite-ids"

export function FavoritesCount() {
  const count = useFavoriteIds().length

  return (
    <p aria-live="polite" className="flex items-center gap-1.5 text-sm whitespace-nowrap">
      <StarIcon aria-hidden className="size-4 fill-current" />
      <span className="tabular-nums">{count}</span> {count === 1 ? "favorite" : "favorites"}
    </p>
  )
}
