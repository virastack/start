import type { useTranslations } from "next-intl"
import { z } from "zod"

/** A factory, so validation errors come in the visitor's language. */
export function createCardFormSchema(t: ReturnType<typeof useTranslations<"CheckoutPayment">>) {
  return z.object({
    cardNumber: z.string().min(1, t("error_number")),
    holderName: z.string().trim().min(1, t("error_holder")).max(60, t("error_too_long")),
    expiry: z.string().min(1, t("error_expiry")),
    cvv: z.string().min(1, t("error_cvv"))
  })
}

export const savedCardResponseSchema = z.object({ id: z.number() })

export type CardFormInput = z.infer<ReturnType<typeof createCardFormSchema>>

/** What may be kept and shown. There is no field for a card number or CVV on purpose. */
export type SavedCard = {
  id: number
  token: string
  bank: string | null
  brand: "visa" | "mastercard" | "amex" | "troy" | "unknown"
  last4: string
  expiry: string
  holderName: string
}
