"use client"

import { useQuery } from "@tanstack/react-query"

import { addressesQueryOptions } from "@/features/checkout-address/api/address.queries"
import * as m from "@/paraglide/messages.js"

export function useAddresses() {
  // The dummy titles are data, so they are worded here. With a real API, remove the `select`.
  const dummyTitles: Record<string, string> = {
    Home: m.checkout_address_dummy_home(),
    Work: m.checkout_address_dummy_work()
  }

  return useQuery({
    ...addressesQueryOptions,
    select: (addresses) =>
      addresses.map((address) => ({
        ...address,
        addressName: dummyTitles[address.addressName] ?? address.addressName
      }))
  })
}
