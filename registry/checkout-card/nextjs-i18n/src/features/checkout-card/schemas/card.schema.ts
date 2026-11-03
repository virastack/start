import type { useTranslations } from "next-intl"
import { z } from "zod"

/** A factory, so validation errors come in the visitor's language. */
export function createCardFormSchema(t: ReturnType<typeof useTranslations<"CheckoutCard">>) {
  return z.object({
    cardNumber: z.string().min(1, t("error_number")),
    holderName: z.string().trim().min(1, t("error_holder")).max(60, t("error_too_long")),
    expiry: z.string().min(1, t("error_expiry")),
    cvv: z.string().min(1, t("error_cvv"))
  })
}

export const savedCardResponseSchema = z.object({ status: z.number() })

export type CardFormInput = z.infer<ReturnType<typeof createCardFormSchema>>

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
