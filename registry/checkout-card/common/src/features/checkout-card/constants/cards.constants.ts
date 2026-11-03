import type { CardAssociation, SavedCard } from "@/features/checkout-card/schemas/card.schema"

/** DummyJSON has no card API; this address only answers 201 Created. Point it at your own API. */
export const CARDS_PATH = "/http/201"

/**
 * Starting data until you connect an API. Like a real saved card, each keeps only its last four
 * digits. They come from iyzico's sandbox test cards, which do no real payment:
 * https://docs.iyzico.com/en/add-ons/test-cards
 */
export const DUMMY_CARDS: SavedCard[] = [
  {
    cardToken: "tok_dummy_garanti",
    cardAssociation: "MASTER_CARD",
    lastFourDigits: "0003",
    expireMonth: "12",
    expireYear: "2030",
    cardHolderName: "Ömer Gülçiçek",
    cardBankName: "Garanti BBVA"
  },
  {
    cardToken: "tok_dummy_akbank",
    cardAssociation: "MASTER_CARD",
    lastFourDigits: "0006",
    expireMonth: "12",
    expireYear: "2030",
    cardHolderName: "Ömer Gülçiçek",
    cardBankName: "Akbank"
  },
  {
    cardToken: "tok_dummy_is_bankasi",
    cardAssociation: "VISA",
    lastFourDigits: "0006",
    expireMonth: "12",
    expireYear: "2030",
    cardHolderName: "Ömer Gülçiçek",
    cardBankName: "Türkiye İş Bankası"
  }
]

/** The masks, shared by the form and its resolver. The CVV follows the card's network. */
export const CARD_MASKS = {
  holderName: { preset: "fullName", autoComplete: "cc-name" },
  cardNumber: "card",
  expiry: "expiry",
  cvv: { preset: "cvv", from: "cardNumber" }
} as const

export const BRAND_NAMES: Record<CardAssociation, string> = {
  VISA: "Visa",
  MASTER_CARD: "Mastercard",
  AMERICAN_EXPRESS: "American Express",
  TROY: "Troy"
}
