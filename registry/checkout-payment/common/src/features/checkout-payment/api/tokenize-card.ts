import { getCardType } from "@virastack/mask"

import type { CardFormInput, SavedCard } from "@/features/checkout-payment/schemas/card.schema"

/**
 * The one place to connect a payment provider: swap the body for its SDK, which turns the card into
 * a token in the browser. Card number and CVV must never reach your server or be stored.
 */
export async function tokenizeCard(input: CardFormInput): Promise<Omit<SavedCard, "id" | "bank">> {
  return {
    token: `tok_dummy_${Date.now()}`,
    brand: getCardType(input.cardNumber),
    last4: input.cardNumber.slice(-4),
    expiry: input.expiry,
    holderName: input.holderName
  }
}
