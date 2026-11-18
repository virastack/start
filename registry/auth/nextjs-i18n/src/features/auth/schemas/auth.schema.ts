import type { PasswordIssue } from "@virastack/password/strength"
import { evaluate } from "@virastack/password/strength"
import type { useTranslations } from "next-intl"
import { z } from "zod"

import { PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"

type AuthTranslator = ReturnType<typeof useTranslations<"Auth">>

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

/** A factory, so validation errors come in the visitor's language. */
export function createLoginFormSchema(t: AuthTranslator) {
  return z.object({
    username: z.string().trim().min(1, t("error_username")),
    // Never trimmed: a space can be part of a password.
    password: z.string().min(1, t("error_password"))
  })
}

/** The package answers with keys; the words are the visitor's language. */
function wordPasswordIssue(t: AuthTranslator, issue: PasswordIssue) {
  const { minLength: min, maxLength: max } = PASSWORD_POLICY
  const messages: Record<PasswordIssue, string> = {
    "password.tooShort": t("issue_too_short", { min }),
    "password.tooLong": t("issue_too_long", { max }),
    "password.noLowercase": t("issue_no_lowercase"),
    "password.noUppercase": t("issue_no_uppercase"),
    "password.noDigit": t("issue_no_digit"),
    "password.noSymbol": t("issue_no_symbol"),
    "password.common": t("issue_common"),
    "password.blocked": t("issue_blocked"),
    "password.repetitive": t("issue_repetitive"),
    "password.containsPersonalInfo": t("issue_personal"),
    "password.mismatch": t("issue_mismatch"),
    "password.pwned": t("issue_pwned")
  }
  return messages[issue]
}

export function createRegisterFormSchema(t: AuthTranslator) {
  return z
    .object({
      firstName: z.string().trim().min(1, t("error_first_name")).max(50, t("error_too_long")),
      lastName: z.string().trim().min(1, t("error_last_name")).max(50, t("error_too_long")),
      username: z
        .string()
        .trim()
        .min(1, t("error_new_username"))
        .max(50, t("error_too_long"))
        .regex(/^[\w.-]+$/, t("error_username_format")),
      email: z
        .string()
        .trim()
        .pipe(z.email(t("error_email"))),
      password: z.string(),
      confirmPassword: z.string()
    })
    .superRefine(({ password, confirmPassword, ...details }, ctx) => {
      // The same policy and personal details as the strength the field shows.
      const [issue] = evaluate(password, PASSWORD_POLICY, {
        forbidden: [details.firstName, details.lastName, details.username, details.email]
      }).issues
      if (issue) {
        ctx.addIssue({ code: "custom", path: ["password"], message: wordPasswordIssue(t, issue) })
      }
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: wordPasswordIssue(t, "password.mismatch")
        })
      }
    })
}

export type SessionUser = z.infer<typeof sessionUserSchema>
export type RegisteredUser = z.infer<typeof registeredUserSchema>
export type LoginFormInput = z.infer<ReturnType<typeof createLoginFormSchema>>
export type RegisterFormInput = z.infer<ReturnType<typeof createRegisterFormSchema>>
