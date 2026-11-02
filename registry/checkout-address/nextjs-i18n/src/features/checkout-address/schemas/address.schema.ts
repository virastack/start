import type { useTranslations } from "next-intl"
import { z } from "zod"

/** A factory, so validation errors come in the visitor's language. */
export function createAddressFormSchema(t: ReturnType<typeof useTranslations<"CheckoutAddress">>) {
  return z.object({
    addressName: z.string().trim().min(1, t("error_title")).max(40, t("error_too_long")),
    firstName: z.string().trim().min(1, t("error_first_name")).max(50, t("error_too_long")),
    lastName: z.string().trim().min(1, t("error_last_name")).max(50, t("error_too_long")),
    phone: z.string().min(1, t("error_phone")),
    addressLine: z.string().trim().min(1, t("error_line")).max(250, t("error_too_long")),
    provinceCode: z.string(),
    province: z.string().min(1, t("error_province")),
    district: z.string().min(1, t("error_district")),
    neighbourhood: z.string().min(1, t("error_neighbourhood")),
    postalCode: z.string().min(1, t("error_postal_code")),
    isDefault: z.boolean()
  })
}

export const savedAddressSchema = z.object({ id: z.number() })

export type AddressFormInput = z.infer<ReturnType<typeof createAddressFormSchema>>
export type Address = AddressFormInput & { id: number }
export type AddressType = "shipping" | "billing"
