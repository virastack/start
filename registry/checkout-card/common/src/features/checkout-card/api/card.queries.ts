import { queryOptions } from "@tanstack/react-query"

import { getCards } from "@/features/checkout-card/api/get-cards.api"
import { cardKeys } from "@/features/checkout-card/api/query-keys"

export const cardsQueryOptions = queryOptions({
  queryKey: cardKeys.all,
  queryFn: getCards,
  // The dummy list only changes in this cache. With a real API, remove this line.
  staleTime: Infinity
})
