import { z } from "zod"

import * as m from "@/paraglide/messages.js"

// `error` is a function because this schema is built once, before any locale is known.
export const cardFormSchema = z.object({
  cardNumber: z.string().min(1, { error: () => m.checkout_payment_error_number() }),
  holderName: z
    .string()
    .trim()
    .min(1, { error: () => m.checkout_payment_error_holder() })
    .max(60, { error: () => m.checkout_payment_error_too_long() }),
  expiry: z.string().min(1, { error: () => m.checkout_payment_error_expiry() }),
  cvv: z.string().min(1, { error: () => m.checkout_payment_error_cvv() })
})

export const savedCardResponseSchema = z.object({ id: z.number() })

export type CardFormInput = z.infer<typeof cardFormSchema>

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
