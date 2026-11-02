import { queryOptions } from "@tanstack/react-query"

import { getCards } from "@/features/checkout-payment/api/get-cards.api"
import { cardKeys } from "@/features/checkout-payment/api/query-keys"

export const cardsQueryOptions = queryOptions({
  queryKey: cardKeys.all,
  queryFn: getCards,
  // The dummy list only changes in this cache. With a real API, remove this line.
  staleTime: Infinity
})
