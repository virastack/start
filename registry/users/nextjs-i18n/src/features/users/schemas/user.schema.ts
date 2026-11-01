import type { useTranslations } from "next-intl"
import { z } from "zod"

// Unknown keys are dropped on purpose: DummyJSON also returns passwords, bank and SSN fields.
export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.email()
})

export const usersPageSchema = z.object({
  users: userSchema.array(),
  total: z.number(),
  skip: z.number(),
  limit: z.number()
})

/** A factory, so validation errors come in the visitor's language. */
export function createAddUserSchema(t: ReturnType<typeof useTranslations<"Users">>) {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(1, t("validation_first_name"))
      .max(50, t("validation_max_length")),
    lastName: z
      .string()
      .trim()
      .min(1, t("validation_last_name"))
      .max(50, t("validation_max_length")),
    email: z.email(t("validation_email"))
  })
}

export type User = z.infer<typeof userSchema>
export type UsersPage = z.infer<typeof usersPageSchema>
export type AddUserInput = z.infer<ReturnType<typeof createAddUserSchema>>
