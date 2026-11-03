import { z } from "zod"

export const cardFormSchema = z.object({
  cardNumber: z.string().min(1, "Enter the card number"),
  holderName: z.string().trim().min(1, "Enter the name on the card").max(60, "This is too long"),
  expiry: z.string().min(1, "Enter the expiry date"),
  cvv: z.string().min(1, "Enter the CVV")
})

export const savedCardResponseSchema = z.object({ status: z.number() })

export type CardFormInput = z.infer<typeof cardFormSchema>

/** iyzico's card networks. */
export type CardAssociation = "VISA" | "MASTER_CARD" | "AMERICAN_EXPRESS" | "TROY"

/**
 * What may be kept and shown, named after iyzico's card storage so its answer maps over:
 * https://docs.iyzico.com/en/advanced/card-storage
 * There is no field for a card number or CVV on purpose.
 */
export type SavedCard = {
  cardToken: string
  /** `null` when the number belongs to none of iyzico's networks. */
  cardAssociation: CardAssociation | null
  lastFourDigits: string
  expireMonth: string
  expireYear: string
  cardHolderName: string
  /** iyzico returns it for cards issued in Türkiye. */
  cardBankName: string | null
}
