import type { PasswordIssue } from "@virastack/password/strength"
import { evaluate } from "@virastack/password/strength"
import { z } from "zod"

import { PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"
import * as m from "@/paraglide/messages"

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
export const registeredUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string()
})

// `error` is a function because these schemas are built once, before any locale is known.
export const loginFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { error: () => m.auth_error_username() }),
  // Never trimmed: a space can be part of a password.
  password: z.string().min(1, { error: () => m.auth_error_password() })
})

const tooLong = { error: () => m.auth_error_too_long() }

/** The package answers with keys; the words are the visitor's language, read at each check. */
const PASSWORD_ISSUES: Record<PasswordIssue, () => string> = {
  "password.tooShort": () => m.auth_issue_too_short({ min: PASSWORD_POLICY.minLength }),
  "password.tooLong": () => m.auth_issue_too_long({ max: PASSWORD_POLICY.maxLength }),
  "password.noLowercase": m.auth_issue_no_lowercase,
  "password.noUppercase": m.auth_issue_no_uppercase,
  "password.noDigit": m.auth_issue_no_digit,
  "password.noSymbol": m.auth_issue_no_symbol,
  "password.common": m.auth_issue_common,
  "password.blocked": m.auth_issue_blocked,
  "password.repetitive": m.auth_issue_repetitive,
  "password.containsPersonalInfo": m.auth_issue_personal,
  "password.mismatch": m.auth_issue_mismatch,
  "password.pwned": m.auth_issue_pwned
}

export const registerFormSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, { error: () => m.auth_error_first_name() })
      .max(50, tooLong),
    lastName: z
      .string()
      .trim()
      .min(1, { error: () => m.auth_error_last_name() })
      .max(50, tooLong),
    username: z
      .string()
      .trim()
      .min(1, { error: () => m.auth_error_new_username() })
      .max(50, tooLong)
      .regex(/^[\w.-]+$/, { error: () => m.auth_error_username_format() }),
    email: z
      .string()
      .trim()
      .pipe(z.email({ error: () => m.auth_error_email() })),
    password: z.string(),
    confirmPassword: z.string()
  })
  .superRefine(({ password, confirmPassword, ...details }, ctx) => {
    // The same policy and personal details as the strength the field shows.
    const [issue] = evaluate(password, PASSWORD_POLICY, {
      forbidden: [details.firstName, details.lastName, details.username, details.email]
    }).issues
    if (issue) {
      ctx.addIssue({ code: "custom", path: ["password"], message: PASSWORD_ISSUES[issue]() })
    }
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: PASSWORD_ISSUES["password.mismatch"]()
      })
    }
  })

export type SessionUser = z.infer<typeof sessionUserSchema>
export type RegisteredUser = z.infer<typeof registeredUserSchema>
export type LoginFormInput = z.infer<typeof loginFormSchema>
export type RegisterFormInput = z.infer<typeof registerFormSchema>
