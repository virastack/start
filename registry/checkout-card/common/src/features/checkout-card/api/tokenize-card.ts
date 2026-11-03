import { getCardType } from "@virastack/mask"

import type {
  CardAssociation,
  CardFormInput,
  SavedCard
} from "@/features/checkout-card/schemas/card.schema"

const ASSOCIATIONS: Record<ReturnType<typeof getCardType>, CardAssociation | null> = {
  visa: "VISA",
  mastercard: "MASTER_CARD",
  amex: "AMERICAN_EXPRESS",
  troy: "TROY",
  unknown: null
}

/**
 * The one place to connect a payment provider. With iyzico, its checkout form takes the card and
 * your server receives the `cardToken`. Card number and CVV must never reach your server or be
 * stored.
 */
export async function tokenizeCard(input: CardFormInput): Promise<Omit<SavedCard, "cardBankName">> {
  return {
    cardToken: `tok_dummy_${Date.now()}`,
    cardAssociation: ASSOCIATIONS[getCardType(input.cardNumber)],
    lastFourDigits: input.cardNumber.slice(-4),
    // The form keeps MMYY; iyzico uses "12" and "2030".
    expireMonth: input.expiry.slice(0, 2),
    expireYear: `20${input.expiry.slice(2, 4)}`,
    cardHolderName: input.holderName
  }
}
