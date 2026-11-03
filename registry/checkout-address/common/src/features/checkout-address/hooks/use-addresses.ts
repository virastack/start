"use client"

import { useQuery } from "@tanstack/react-query"

import { addressesQueryOptions } from "@/features/checkout-address/api/address.queries"

export function useAddresses() {
  return useQuery(addressesQueryOptions)
}
