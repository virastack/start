import { z } from "zod"

import * as m from "@/paraglide/messages.js"

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

// `error` is a function because this schema is built once, before any locale is known.
const tooLong = { error: () => m.users_error_too_long() }

export const userFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: () => m.users_error_first_name() })
    .max(50, tooLong),
  lastName: z
    .string()
    .trim()
    .min(1, { error: () => m.users_error_last_name() })
    .max(50, tooLong),
  username: z
    .string()
    .trim()
    .min(1, { error: () => m.users_error_username() })
    .max(50, tooLong)
    .regex(/^[\w.-]+$/, { error: () => m.users_error_username_format() }),
  title: z
    .string()
    .trim()
    .min(1, { error: () => m.users_error_title() })
    .max(50, tooLong),
  department: z
    .string()
    .trim()
    .min(1, { error: () => m.users_error_department() })
    .max(50, tooLong),
  role: userRoleSchema
})

export const deletedUserSchema = z.object({ id: z.number() })

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UsersPage = z.infer<typeof usersPageSchema>
export type UserFormInput = z.infer<typeof userFormSchema>
