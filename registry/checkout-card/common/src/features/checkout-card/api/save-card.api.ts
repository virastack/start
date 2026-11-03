import { api } from "@/lib/api"

import { CARDS_PATH } from "@/features/checkout-card/constants/cards.constants"
import { savedCardResponseSchema } from "@/features/checkout-card/schemas/card.schema"
import type { SavedCard } from "@/features/checkout-card/schemas/card.schema"

/**
 * Sends the token and display details only. The request is real, but DummyJSON only answers
 * 201 Created, so the result is built here. iyzico answers with the stored card, bank name
 * included; with your API, return its answer.
 */
export async function saveCard(card: Omit<SavedCard, "cardBankName">): Promise<SavedCard> {
  await api.post(CARDS_PATH, card, { schema: savedCardResponseSchema })

  return { ...card, cardBankName: null }
}
