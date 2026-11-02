import { DUMMY_CARDS } from "@/features/checkout-payment/constants/cards.constants"
import type { SavedCard } from "@/features/checkout-payment/schemas/card.schema"

/** No request yet: replace the body with `api.get(CARDS_PATH, { schema })` for your API. */
export async function getCards(): Promise<SavedCard[]> {
  return DUMMY_CARDS
}
