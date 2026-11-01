"use client"

import { useFavoriteIds } from "@/features/users/hooks/use-favorite-ids"
import * as m from "@/paraglide/messages.js"

export function FavoritesCount() {
  const count = useFavoriteIds().length

  return (
    <p aria-live="polite" className="text-sm whitespace-nowrap tabular-nums">
      {m.users_favorites_count({ count })}
    </p>
  )
}
