"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { addressKeys } from "@/features/checkout-address/api/query-keys"
import { saveAddress } from "@/features/checkout-address/api/save-address.api"
import type { Address, AddressFormInput } from "@/features/checkout-address/schemas/address.schema"

type SaveAddressVariables = { input: AddressFormInput; id?: number }

/** One default at a time. With a real API, invalidate `addressKeys.all` instead of this. */
function mergeAddress(addresses: Address[] = [], saved: Address) {
  const others = addresses.map((address) =>
    saved.isDefault ? { ...address, isDefault: false } : address
  )
  return addresses.some(({ id }) => id === saved.id)
    ? others.map((address) => (address.id === saved.id ? saved : address))
    : [...others, saved]
}

export function useSaveAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ input, id }: SaveAddressVariables) => saveAddress(input, id),
    onSuccess: (saved) =>
      queryClient.setQueryData<Address[]>(addressKeys.all, (addresses) =>
        mergeAddress(addresses, saved)
      )
  })
}
