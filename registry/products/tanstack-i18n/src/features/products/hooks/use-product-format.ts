import { getLocale } from "@/paraglide/runtime"

/**
 * Prices, ratings and dates in the visitor's language. DummyJSON prices are in US dollars, so the
 * currency stays while the format follows the locale. Dates are in UTC, so the server and the
 * browser write the same day.
 */
export function useProductFormat() {
  const locale = getLocale()

  return {
    price: (value: number) =>
      new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(value),
    number: (value: number) =>
      new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value),
    rating: (value: number) =>
      new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
        value
      ),
    date: (value: string) =>
      new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(
        new Date(value)
      )
  }
}
