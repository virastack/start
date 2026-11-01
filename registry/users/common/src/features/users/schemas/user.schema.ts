import { z } from "zod"

export const userRoleSchema = z.enum(["admin", "moderator", "user"])

// Unknown keys are dropped on purpose: DummyJSON also returns passwords, bank and SSN fields.
export const userSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.email(),
  image: z.string().optional(),
  role: userRoleSchema.default("user")
})

export const usersPageSchema = z.object({
  users: userSchema.array(),
  total: z.number(),
  skip: z.number(),
  limit: z.number()
})

export const addUserSchema = z.object({
  firstName: z.string().trim().min(1, "Enter a first name").max(50, "Use 50 characters or fewer"),
  lastName: z.string().trim().min(1, "Enter a last name").max(50, "Use 50 characters or fewer"),
  email: z.email("Enter a valid email address")
})

export type User = z.infer<typeof userSchema>
export type UserRole = z.infer<typeof userRoleSchema>
export type UsersPage = z.infer<typeof usersPageSchema>
export type AddUserInput = z.infer<typeof addUserSchema>
