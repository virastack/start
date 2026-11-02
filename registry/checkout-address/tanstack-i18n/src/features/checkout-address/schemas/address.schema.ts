import { z } from "zod"

import * as m from "@/paraglide/messages.js"

// `error` is a function because this schema is built once, before any locale is known.
export const addressFormSchema = z.object({
  addressName: z
    .string()
    .trim()
    .min(1, { error: () => m.checkout_address_error_title() })
    .max(40, { error: () => m.checkout_address_error_too_long() }),
  firstName: z
    .string()
    .trim()
    .min(1, { error: () => m.checkout_address_error_first_name() })
    .max(50, { error: () => m.checkout_address_error_too_long() }),
  lastName: z
    .string()
    .trim()
    .min(1, { error: () => m.checkout_address_error_last_name() })
    .max(50, { error: () => m.checkout_address_error_too_long() }),
  phone: z.string().min(1, { error: () => m.checkout_address_error_phone() }),
  addressLine: z
    .string()
    .trim()
    .min(1, { error: () => m.checkout_address_error_line() })
    .max(250, { error: () => m.checkout_address_error_too_long() }),
  provinceCode: z.string(),
  province: z.string().min(1, { error: () => m.checkout_address_error_province() }),
  district: z.string().min(1, { error: () => m.checkout_address_error_district() }),
  neighbourhood: z.string().min(1, { error: () => m.checkout_address_error_neighbourhood() }),
  postalCode: z.string().min(1, { error: () => m.checkout_address_error_postal_code() }),
  isDefault: z.boolean()
})

export const savedAddressSchema = z.object({ id: z.number() })

export type AddressFormInput = z.infer<typeof addressFormSchema>
export type Address = AddressFormInput & { id: number }
export type AddressType = "shipping" | "billing"
