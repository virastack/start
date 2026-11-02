import { queryOptions } from "@tanstack/react-query"

import { getAddresses } from "@/features/checkout-address/api/get-addresses.api"
import { addressKeys } from "@/features/checkout-address/api/query-keys"

export const addressesQueryOptions = queryOptions({
  queryKey: addressKeys.all,
  queryFn: getAddresses,
  // The dummy list only changes in this cache. With a real API, remove this line.
  staleTime: Infinity
})
