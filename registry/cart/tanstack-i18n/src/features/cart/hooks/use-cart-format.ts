import { CART_CURRENCY } from "@/features/cart/constants/cart.constants"
import { getLocale } from "@/paraglide/runtime"

/** Prices in the visitor's language. DummyJSON's are in US dollars, so the currency stays. */
export function useCartFormat() {
  const locale = getLocale()

  return {
    price: (value: number) =>
      new Intl.NumberFormat(locale, { style: "currency", currency: CART_CURRENCY }).format(value)
  }
}
