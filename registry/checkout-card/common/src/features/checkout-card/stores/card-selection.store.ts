import { create } from "zustand"

type CardSelectionState = {
  /** Only the token: the cards themselves stay in the Query cache. */
  selectedToken: string | null
  setSelectedToken: (token: string) => void
}

// Client-only UI state, so a module-level store is fine. Not persisted, and never holds card data.
export const useCardSelectionStore = create<CardSelectionState>()((set) => ({
  selectedToken: null,
  setSelectedToken: (selectedToken) => set({ selectedToken })
}))
