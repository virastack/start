"use client"

import { EyeIcon, EyeOffIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useViraPassword } from "@virastack/password"
import { useTranslations } from "next-intl"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthLink } from "@/features/auth/components/AuthLink"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { SignedInCard } from "@/features/auth/components/SignedInCard"
import { DEMO_ACCOUNT, REGISTER_ROUTE } from "@/features/auth/constants/auth.constants"
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
    resolver: zodResolver(createLoginFormSchema(t)),
    defaultValues: { username: "", password: "" }
  })
  const { errors, isSubmitting } = form.formState
  // From `useWatch`, so `setValue` and `reset` reach the hook too.
  const passwordValue = useWatch({ control: form.control, name: "password" })
  // No policy: signing in checks the password, it does not judge it.
  const password = useViraPassword({
    id: "password",
    value: passwordValue,
    icons: { show: <EyeIcon aria-hidden />, hide: <EyeOffIcon aria-hidden /> },
    btnProps: { "aria-label": t("show_password") },
    inputProps: {
      "aria-invalid": Boolean(errors.password),
      ...(errors.password && { "aria-describedby": "password-error" })
    }
  })

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      await login.mutateAsync(input)
      // The form stays mounted under the signed-in card, so the password leaves it now.
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
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed p-3 text-sm">
        <p className="text-muted-foreground">
          {t("demo_account")}{" "}
          <span className="font-mono text-foreground">{DEMO_ACCOUNT.username}</span> /{" "}
          <span className="font-mono text-foreground">{DEMO_ACCOUNT.password}</span>
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            form.clearErrors()
            form.setValue("username", DEMO_ACCOUNT.username)
            form.setValue("password", DEMO_ACCOUNT.password)
          }}
        >
          {t("use_demo_account")}
        </Button>
      </div>
      {/* `post`: before hydration the browser submits natively, and a GET puts the password in the URL. */}
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field data-invalid={Boolean(errors.username)}>
          <FieldLabel htmlFor="username">{t("field_username")}</FieldLabel>
          <Input
            {...form.register("username")}
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username ? (
            <FieldError id="username-error">{errors.username.message}</FieldError>
          ) : null}
        </Field>
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">{t("field_password")}</FieldLabel>
          <PasswordInput
            {...form.register("password")}
            password={password}
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
