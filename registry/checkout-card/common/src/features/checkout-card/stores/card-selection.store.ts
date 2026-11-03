import { create } from "zustand"

type CardSelectionState = {
  /** Only the id: the cards themselves stay in the Query cache. */
  selectedId: number | null
  setSelectedId: (id: number) => void
}

// Client-only UI state, so a module-level store is fine. Not persisted, and never holds card data.
export const useCardSelectionStore = create<CardSelectionState>()((set) => ({
  selectedId: null,
  setSelectedId: (selectedId) => set({ selectedId })
}))
