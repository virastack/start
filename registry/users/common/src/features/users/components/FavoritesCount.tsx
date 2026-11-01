"use client"

import { useFavoriteIds } from "@/features/users/hooks/use-favorite-ids"

export function FavoritesCount() {
  const count = useFavoriteIds().length

  return (
    <p aria-live="polite" className="text-sm whitespace-nowrap tabular-nums">
      {count} {count === 1 ? "favorite" : "favorites"}
    </p>
  )
}
