import type { useTranslations } from "next-intl"
import { z } from "zod"

export const ADDRESS_TAX_TYPES = ["individual", "corporate"] as const

type CorporateField = "companyName" | "taxNumber" | "taxOffice"

/** These fields show, and are required, only on a corporate address. */
function isFilledForType(field: CorporateField) {
  return (input: { addressType: string } & Record<CorporateField, string>) =>
    input.addressType !== "corporate" || input[field].trim().length > 0
}

/** Without this the corporate errors wait until every other field is valid. */
const alwaysCheck = () => true

/** A factory, so validation errors come in the visitor's language. */
export function createAddressFormSchema(t: ReturnType<typeof useTranslations<"CheckoutAddress">>) {
  return z
    .object({
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
      isDefault: z.boolean(),
      addressType: z.enum(ADDRESS_TAX_TYPES),
      companyName: z.string().trim().max(100, t("error_too_long")),
      taxNumber: z.string(),
      taxOffice: z.string().trim().max(60, t("error_too_long"))
    })
    .refine(isFilledForType("companyName"), {
      path: ["companyName"],
      message: t("error_company"),
      when: alwaysCheck
    })
    .refine(isFilledForType("taxNumber"), {
      path: ["taxNumber"],
      message: t("error_tax_number"),
      when: alwaysCheck
    })
    .refine(isFilledForType("taxOffice"), {
      path: ["taxOffice"],
      message: t("error_tax_office"),
      when: alwaysCheck
    })
}

export const savedAddressSchema = z.object({ id: z.number() })

export type AddressFormInput = z.infer<ReturnType<typeof createAddressFormSchema>>
export type Address = AddressFormInput & { id: number }
export type AddressType = "shipping" | "billing"
