import type { useTranslations } from "next-intl"
import { z } from "zod"

export const userRoleSchema = z.enum(["admin", "moderator", "user"])

// Unknown keys are dropped on purpose: DummyJSON also returns passwords, bank and SSN fields.
export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  role: userRoleSchema.default("user"),
  // The list can hold people without a company.
  company: z.object({ title: z.string(), department: z.string() }).optional()
})

export const usersPageSchema = z.object({
  users: userSchema.array(),
  total: z.number(),
  skip: z.number(),
  limit: z.number()
})

/** A factory, so validation errors come in the visitor's language. */
export function createUserFormSchema(t: ReturnType<typeof useTranslations<"Users">>) {
  const tooLong = t("validation_max_length")

  return z.object({
    firstName: z.string().trim().min(1, t("validation_first_name")).max(50, tooLong),
    lastName: z.string().trim().min(1, t("validation_last_name")).max(50, tooLong),
    username: z
      .string()
      .trim()
      .min(1, t("validation_username"))
      .max(50, tooLong)
      .regex(/^[\w.-]+$/, t("validation_username_format")),
    title: z.string().trim().min(1, t("validation_title")).max(50, tooLong),
    department: z.string().trim().min(1, t("validation_department")).max(50, tooLong),
    role: userRoleSchema
  })
}

export const deletedUserSchema = z.object({ id: z.number() })

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UsersPage = z.infer<typeof usersPageSchema>
export type UserFormInput = z.infer<ReturnType<typeof createUserFormSchema>>
