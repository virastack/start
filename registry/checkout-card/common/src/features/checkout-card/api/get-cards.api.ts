import { DUMMY_CARDS } from "@/features/checkout-card/constants/cards.constants"
import type { SavedCard } from "@/features/checkout-card/schemas/card.schema"

/** No request yet: replace the body with a request to your API, `api.get(path, { schema })`. */
export async function getCards(): Promise<SavedCard[]> {
  return DUMMY_CARDS
}
