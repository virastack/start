"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { addressesQueryOptions } from "@/features/checkout-address/api/address.queries"

export function useAddresses() {
  const t = useTranslations("CheckoutAddress")
  // The dummy titles are data, so they are worded here. With a real API, remove the `select`.
  const dummyTitles: Record<string, string> = { Home: t("dummy_home"), Work: t("dummy_work") }

  return useQuery({
    ...addressesQueryOptions,
    select: (addresses) =>
      addresses.map((address) => ({
        ...address,
        addressName: dummyTitles[address.addressName] ?? address.addressName
      }))
  })
}
