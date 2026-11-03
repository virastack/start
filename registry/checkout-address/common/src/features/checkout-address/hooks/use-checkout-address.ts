"use client"

import { useAddresses } from "@/features/checkout-address/hooks/use-addresses"
import { useAddressSelectionStore } from "@/features/checkout-address/stores/address-selection.store"

/**
 * What the module gives the next checkout step: the chosen addresses, ready to send.
 * A choice falls back to the default address, then to the first one.
 */
export function useCheckoutAddress() {
  const { data: addresses = [] } = useAddresses()
  const { shippingId, billingId, isBillingSameAsShipping } = useAddressSelectionStore()

  const fallback = addresses.find(({ isDefault }) => isDefault) ?? addresses[0] ?? null
  const shipping = addresses.find(({ id }) => id === shippingId) ?? fallback
  const billing = isBillingSameAsShipping
    ? shipping
    : (addresses.find(({ id }) => id === billingId) ?? shipping)

  return { shipping, billing, isBillingSameAsShipping }
}
