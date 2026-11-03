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

const TOO_LONG = "Use 50 characters or fewer"

/** The same details the table shows. */
export const userFormSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name").max(50, TOO_LONG),
  lastName: z.string().trim().min(1, "Enter a last name").max(50, TOO_LONG),
  username: z
    .string()
    .trim()
    .min(1, "Enter a username")
    .max(50, TOO_LONG)
    .regex(/^[\w.-]+$/, "Use letters, numbers, dots, hyphens or underscores"),
  title: z.string().trim().min(1, "Enter a position").max(50, TOO_LONG),
  department: z.string().trim().min(1, "Enter a department").max(50, TOO_LONG),
  role: userRoleSchema
})

export const deletedUserSchema = z.object({ id: z.number() })

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UsersPage = z.infer<typeof usersPageSchema>
export type UserFormInput = z.infer<typeof userFormSchema>
