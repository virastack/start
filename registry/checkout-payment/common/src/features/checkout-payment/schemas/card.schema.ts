import { z } from "zod"

export const cardFormSchema = z.object({
  cardNumber: z.string().min(1, "Enter the card number"),
  holderName: z.string().trim().min(1, "Enter the name on the card").max(60, "This is too long"),
  expiry: z.string().min(1, "Enter the expiry date"),
  cvv: z.string().min(1, "Enter the CVV")
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
