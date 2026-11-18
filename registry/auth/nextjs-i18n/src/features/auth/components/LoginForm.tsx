"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { maskResolver, useViraMask } from "@virastack/mask"
import { useViraPassword } from "@virastack/password"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthLink } from "@/features/auth/components/AuthLink"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { SignedInCard } from "@/features/auth/components/SignedInCard"
import { DEMO_ACCOUNT, LOGIN_MASKS, REGISTER_ROUTE } from "@/features/auth/constants/auth.constants"
import { isInvalidCredentials } from "@/features/auth/helpers/is-invalid-credentials"
import { useLogin } from "@/features/auth/hooks/use-login"
import { useSession } from "@/features/auth/hooks/use-session"
import { createLoginFormSchema } from "@/features/auth/schemas/auth.schema"
import type { LoginFormInput } from "@/features/auth/schemas/auth.schema"

export function LoginForm() {
  const t = useTranslations("Auth")
  const session = useSession()
  const login = useLogin()
  const form = useForm<LoginFormInput>({
    resolver: maskResolver(LOGIN_MASKS, zodResolver(createLoginFormSchema(t))),
    // The demo account, so one click signs in. With your API, start both fields empty.
    defaultValues: { username: DEMO_ACCOUNT.username, password: DEMO_ACCOUNT.password }
  })
  const { username } = useViraMask(form, LOGIN_MASKS)
  const { errors, isSubmitting } = form.formState
  // Bound to the form, so `password.inputProps` holds `register()`. With the resolver its rule does
  // not run: the schema checks the field.
  const { password } = useViraPassword(form, {
    password: { btnProps: { "aria-label": t("toggle_password") } }
  })

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      await login.mutateAsync(input)
      // The form stays mounted under the signed-in card, so the password typed leaves it now; it
      // goes back to its default values, ready for the next sign-in after a sign-out.
      form.reset()
    } catch (error) {
      form.setValue("password", "")
      form.setError("root.server", {
        message: isInvalidCredentials(error) ? t("error_credentials") : t("error_login")
      })
      form.setFocus("password")
    } finally {
      // The mutation's variables hold the password: drop them once the answer is in.
      login.reset()
    }
  })

  // The form shows until the session says someone is signed in, so the server renders it too and
  // it works before hydration.
  if (session.data) return <SignedInCard user={session.data} />

  return (
    <div className="flex flex-col gap-6">
      {/* `post`: before hydration the browser submits natively, and a GET puts the password in the URL. */}
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="username">{t("field_username")}</FieldLabel>
          <Input
            {...username}
            id="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username ? (
            <FieldError id="username-error">{errors.username.message}</FieldError>
          ) : null}
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor={password.inputProps.id}>{t("field_password")}</FieldLabel>
          <PasswordInput
            password={password}
            errorId={errors.password && "password-error"}
            capsLockHint={t("caps_lock")}
          />
          {errors.password ? (
            <FieldError id="password-error">{errors.password.message}</FieldError>
          ) : null}
        </Field>
        {errors.root?.server ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.root.server.message}
          </p>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("signing_in") : t("sign_in")}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {t("no_account")}{" "}
        <AuthLink
          href={REGISTER_ROUTE}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {t("create_one")}
        </AuthLink>
      </p>
    </div>
  )
}
