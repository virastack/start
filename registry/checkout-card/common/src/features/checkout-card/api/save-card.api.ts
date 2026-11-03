import { api } from "@/lib/api"

import { CARDS_PATH } from "@/features/checkout-payment/constants/cards.constants"
import { savedCardResponseSchema } from "@/features/checkout-payment/schemas/card.schema"
import type { SavedCard } from "@/features/checkout-payment/schemas/card.schema"

/**
 * Sends the token and display details only. The request is real, but DummyJSON keeps nothing and
 * answers every new user with the same id, so the result is built here. With your API, return its
 * answer.
 */
export async function saveCard(card: Omit<SavedCard, "id" | "bank">): Promise<SavedCard> {
  await api.post(`${CARDS_PATH}/add`, card, { schema: savedCardResponseSchema })

  return { ...card, id: Date.now(), bank: null }
}
