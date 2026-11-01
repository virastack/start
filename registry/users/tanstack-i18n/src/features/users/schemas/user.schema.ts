import { z } from "zod"

import * as m from "@/paraglide/messages.js"

export const userRoleSchema = z.enum(["admin", "moderator", "user"])

// Unknown keys are dropped on purpose: DummyJSON also returns passwords, bank and SSN fields.
export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.email(),
  role: userRoleSchema.default("user"),
  // A new user comes back from `POST /users/add` without a company.
  company: z.object({ title: z.string(), department: z.string() }).optional()
})

export const usersPageSchema = z.object({
  users: userSchema.array(),
  total: z.number(),
  skip: z.number(),
  limit: z.number()
})

// `error` is a function because this schema is built once, before any locale is known.
export const addUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, { error: () => m.users_error_first_name() })
    .max(50, { error: () => m.users_error_too_long() }),
  lastName: z
    .string()
    .trim()
    .min(1, { error: () => m.users_error_last_name() })
    .max(50, { error: () => m.users_error_too_long() }),
  email: z.email({ error: () => m.users_error_email() })
})

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UsersPage = z.infer<typeof usersPageSchema>
export type AddUserInput = z.infer<typeof addUserSchema>
