"use client"

import { useIsClient } from "usehooks-ts"

import { useFavoritesStore } from "@/features/users/stores/favorites.store"

const NO_FAVORITES: number[] = []

/** Persisted values exist only in the browser, so the server render and hydration see none. */
export function useFavoriteIds() {
  const ids = useFavoritesStore((state) => state.ids)
  const isClient = useIsClient()

  return isClient ? ids : NO_FAVORITES
}
