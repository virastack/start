import type { SavedCard } from "@/features/checkout-payment/schemas/card.schema"

/** DummyJSON has no card API, so its users stand in. Point this at your own API. */
export const CARDS_PATH = "/users"

/**
 * Starting data until you connect an API. Like a real saved card, each keeps only its last four
 * digits. They come from iyzico's sandbox test cards, which do no real payment:
 * https://docs.iyzico.com/en/add-ons/test-cards
 */
export const DUMMY_CARDS: SavedCard[] = [
  {
    id: 1,
    token: "tok_dummy_garanti",
    bank: "Garanti BBVA",
    brand: "mastercard",
    last4: "0003",
    expiry: "1230",
    holderName: "Ömer Gülçiçek"
  },
  {
    id: 2,
    token: "tok_dummy_akbank",
    bank: "Akbank",
    brand: "mastercard",
    last4: "0006",
    expiry: "1230",
    holderName: "Ömer Gülçiçek"
  },
  {
    id: 3,
    token: "tok_dummy_is_bankasi",
    bank: "Türkiye İş Bankası",
    brand: "visa",
    last4: "0006",
    expiry: "1230",
    holderName: "Ömer Gülçiçek"
  }
]

/** The masks, shared by the form and its resolver. The CVV follows the card's network. */
export const CARD_MASKS = {
  cardNumber: "card",
  expiry: "expiry",
  cvv: { preset: "cvv", from: "cardNumber" }
} as const

export const BRAND_NAMES: Record<SavedCard["brand"], string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  troy: "Troy",
  unknown: "Card"
}
