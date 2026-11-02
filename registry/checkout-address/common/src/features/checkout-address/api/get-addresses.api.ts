import { DUMMY_ADDRESSES } from "@/features/checkout-address/constants/addresses.constants"
import type { Address } from "@/features/checkout-address/schemas/address.schema"

/** No request yet: replace the body with `api.get(ADDRESSES_PATH, { schema })` for your API. */
export async function getAddresses(): Promise<Address[]> {
  return DUMMY_ADDRESSES
}
