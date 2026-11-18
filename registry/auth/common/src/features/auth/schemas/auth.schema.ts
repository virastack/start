import type { PasswordIssue } from "@virastack/password/strength"
import { evaluate } from "@virastack/password/strength"
import { z } from "zod"

import {
  NAME_MAX_LENGTH,
  PASSWORD_POLICY,
  USERNAME_MAX_LENGTH
} from "@/features/auth/constants/auth.constants"

/**
 * The signed-in user. DummyJSON also sends an access and a refresh token: they are left out on
 * purpose, so no token reaches the page, the cache or the devtools. Your API should keep the
 * session in an `httpOnly` cookie it sets itself.
 */
export const sessionUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string().optional()
})

/** The new account. DummyJSON echoes everything it was sent, the password too: it is left out. */
export const registeredUserSchema = sessionUserSchema.omit({ image: true })

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, "Enter your username"),
  // Never trimmed: a space can be part of a password.
  password: z.string().min(1, "Enter your password")
})

const tooLong = (max: number) => `Use ${max} characters or fewer`

/** The package answers with keys; the words are the form's. */
const PASSWORD_ISSUES: Record<PasswordIssue, string> = {
  "password.tooShort": `Use at least ${PASSWORD_POLICY.minLength} characters`,
  "password.tooLong": `Use at most ${PASSWORD_POLICY.maxLength} characters`,
  "password.noLowercase": "Add a lowercase letter",
  "password.noUppercase": "Add an uppercase letter",
  "password.noDigit": "Add a digit",
  "password.noSymbol": "Add a symbol",
  "password.common": "This password is too common",
  "password.blocked": "Choose a different password",
  "password.repetitive": "Avoid repeats and sequences like aaaa or 1234",
  "password.containsPersonalInfo": "Don't use your name, username or email",
  "password.mismatch": "The passwords don't match",
  "password.pwned": "This password appeared in a data breach. Choose another one"
}

export const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Enter your first name")
      .max(NAME_MAX_LENGTH, tooLong(NAME_MAX_LENGTH)),
    lastName: z
      .string()
      .trim()
      .min(1, "Enter your last name")
      .max(NAME_MAX_LENGTH, tooLong(NAME_MAX_LENGTH)),
    username: z
      .string()
      .trim()
      .min(1, "Choose a username")
      .max(USERNAME_MAX_LENGTH, tooLong(USERNAME_MAX_LENGTH))
      .regex(/^[a-z0-9._-]+$/, "Use lowercase letters, numbers, dots, hyphens or underscores"),
    email: z.string().trim().pipe(z.email("Enter a valid email address")),
    password: z.string(),
    confirmPassword: z.string()
  })
  .superRefine(({ password, confirmPassword, ...details }, ctx) => {
    // The same policy and personal details as the strength the field shows.
    const [issue] = evaluate(password, PASSWORD_POLICY, {
      forbidden: [details.firstName, details.lastName, details.username, details.email]
    }).issues
    if (issue) ctx.addIssue({ code: "custom", path: ["password"], message: PASSWORD_ISSUES[issue] })
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: PASSWORD_ISSUES["password.mismatch"]
      })
    }
  })

export type SessionUser = z.infer<typeof sessionUserSchema>
export type RegisteredUser = z.infer<typeof registeredUserSchema>
export type LoginFormInput = z.infer<typeof loginFormSchema>
export type RegisterFormInput = z.infer<typeof registerFormSchema>
