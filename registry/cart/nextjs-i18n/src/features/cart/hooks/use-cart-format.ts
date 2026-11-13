"use client"

import { useFormatter } from "next-intl"

import { CART_CURRENCY } from "@/features/cart/constants/cart.constants"

/** Prices in the visitor's language. DummyJSON's are in US dollars, so the currency stays. */
export function useCartFormat() {
  const format = useFormatter()

  return {
    price: (value: number) => format.number(value, { style: "currency", currency: CART_CURRENCY })
  }
}
