"use client"

import { useCards } from "@/features/checkout-card/hooks/use-cards"
import { useCardSelectionStore } from "@/features/checkout-card/stores/card-selection.store"

/** What the module gives the next checkout step: the chosen card, with no card number or CVV. */
export function useCheckoutCard() {
  const { data: cards = [] } = useCards()
  const selectedToken = useCardSelectionStore((state) => state.selectedToken)

  return { card: cards.find(({ cardToken }) => cardToken === selectedToken) ?? cards[0] ?? null }
}
