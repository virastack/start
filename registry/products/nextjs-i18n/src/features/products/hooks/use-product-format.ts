"use client"

import { useFormatter } from "next-intl"

/**
 * Prices, ratings and dates in the visitor's language. DummyJSON prices are in US dollars, so the
 * currency stays while the format follows the locale. Dates are in UTC, so the server and the
 * browser write the same day.
 */
export function useProductFormat() {
  const format = useFormatter()

  return {
    price: (value: number) => format.number(value, { style: "currency", currency: "USD" }),
    number: (value: number) => format.number(value, { maximumFractionDigits: 2 }),
    rating: (value: number) =>
      format.number(value, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    date: (value: string) =>
      format.dateTime(new Date(value), { dateStyle: "medium", timeZone: "UTC" })
  }
}
