import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type FavoritesState = {
  /** Only ids: the user data itself stays in the Query cache. */
  ids: number[]
  toggle: (id: number) => void
}

// Client-only UI state, so a module-level store is fine.
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((favoriteId) => favoriteId !== id)
            : [...state.ids, id]
        }))
    }),
    { name: "favorite-users", storage: createJSONStorage(() => localStorage) }
  )
)
