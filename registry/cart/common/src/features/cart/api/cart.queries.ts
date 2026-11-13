import { queryOptions } from "@tanstack/react-query"

import { getCart } from "@/features/cart/api/get-cart.api"
import { cartKeys } from "@/features/cart/api/query-keys"

export const cartQueryOptions = queryOptions({
  queryKey: cartKeys.all,
  queryFn: ({ signal }) => getCart(signal),
  // DummyJSON keeps no change, so a new fetch would bring its first cart back and undo the
  // visitor's. With a real API, remove this line, unless the selection stays in the browser
  // (`selection.api.ts`).
  staleTime: Infinity
})
