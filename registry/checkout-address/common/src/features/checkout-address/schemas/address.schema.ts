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

export const addressFormSchema = z
  .object({
    addressName: z.string().trim().min(1, "Enter an address title").max(40, "This is too long"),
    firstName: z.string().trim().min(1, "Enter a first name").max(50, "This is too long"),
    lastName: z.string().trim().min(1, "Enter a last name").max(50, "This is too long"),
    phone: z.string().min(1, "Enter a mobile phone number"),
    addressLine: z.string().trim().min(1, "Enter the address line").max(250, "This is too long"),
    provinceCode: z.string(),
    province: z.string().min(1, "Select a province"),
    district: z.string().min(1, "Select a district"),
    neighbourhood: z.string().min(1, "Select a neighbourhood"),
    postalCode: z.string().min(1, "Enter the postal code"),
    isDefault: z.boolean(),
    addressType: z.enum(ADDRESS_TAX_TYPES),
    companyName: z.string().trim().max(100, "This is too long"),
    taxNumber: z.string(),
    taxOffice: z.string().trim().max(60, "This is too long")
  })
  .refine(isFilledForType("companyName"), {
    path: ["companyName"],
    message: "Enter the company name",
    when: alwaysCheck
  })
  .refine(isFilledForType("taxNumber"), {
    path: ["taxNumber"],
    message: "Enter the tax number",
    when: alwaysCheck
  })
  .refine(isFilledForType("taxOffice"), {
    path: ["taxOffice"],
    message: "Enter the tax office",
    when: alwaysCheck
  })

export const savedAddressSchema = z.object({ id: z.number() })

export type AddressFormInput = z.infer<typeof addressFormSchema>
export type Address = AddressFormInput & { id: number }
export type AddressType = "shipping" | "billing"
