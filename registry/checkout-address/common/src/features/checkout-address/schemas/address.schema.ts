import { z } from "zod"

export const addressFormSchema = z.object({
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
  isDefault: z.boolean()
})

export const savedAddressSchema = z.object({ id: z.number() })

export type AddressFormInput = z.infer<typeof addressFormSchema>
export type Address = AddressFormInput & { id: number }
export type AddressType = "shipping" | "billing"
