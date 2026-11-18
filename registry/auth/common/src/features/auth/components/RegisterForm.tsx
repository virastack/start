"use client"

import { useState } from "react"
import type { ReactNode } from "react"

import { EyeIcon, EyeOffIcon } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useViraPassword } from "@virastack/password"
import { useForm, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthLink } from "@/features/auth/components/AuthLink"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { PasswordStrength } from "@/features/auth/components/PasswordStrength"
import { RegisterSuccess } from "@/features/auth/components/RegisterSuccess"
import { LOGIN_ROUTE, PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"
import { useRegister } from "@/features/auth/hooks/use-register"
import { registerFormSchema } from "@/features/auth/schemas/auth.schema"
import type { RegisteredUser, RegisterFormInput } from "@/features/auth/schemas/auth.schema"

const EMPTY_VALUES: RegisterFormInput = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
}

const ICONS = { show: <EyeIcon aria-hidden />, hide: <EyeOffIcon aria-hidden /> }

type TextFieldName = Exclude<keyof RegisterFormInput, "password" | "confirmPassword">

export function RegisterForm() {
  const registerAccount = useRegister()
  const [created, setCreated] = useState<RegisteredUser | null>(null)
  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: EMPTY_VALUES
  })
  const { errors, isSubmitting } = form.formState
  // From `useWatch`, so the strength follows `setValue` and `reset` too.
  const [password, confirmPassword, firstName, lastName, username, email] = useWatch({
    control: form.control,
    name: ["password", "confirmPassword", "firstName", "lastName", "username", "email"]
  })
  const newPassword = useViraPassword({
    id: "password",
    policy: PASSWORD_POLICY,
    value: password,
    forbidden: [firstName, lastName, username, email],
    icons: ICONS,
    btnProps: { "aria-label": "Show password" },
    inputProps: {
      "aria-invalid": Boolean(errors.password),
      // Only with an error, which the hook adds to the strength's id: an `undefined` would
      // replace it.
      ...(errors.password && { "aria-describedby": "password-error" })
    }
  })
  const confirm = useViraPassword({
    id: "confirmPassword",
    matchWith: password,
    value: confirmPassword,
    icons: ICONS,
    btnProps: { "aria-label": "Show password confirmation" },
    inputProps: {
      "aria-invalid": Boolean(errors.confirmPassword),
      ...(errors.confirmPassword && { "aria-describedby": "confirmPassword-error" })
    }
  })

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      setCreated(await registerAccount.mutateAsync(input))
      // The form stays mounted under the result, so the password leaves it now.
      form.reset(EMPTY_VALUES)
    } catch {
      form.setError("root.server", { message: "Could not create the account. Try again." })
    } finally {
      // The mutation's variables hold the password: drop them once the answer is in.
      registerAccount.reset()
    }
  })

  if (created) return <RegisterSuccess user={created} onReset={() => setCreated(null)} />

  const textField = (name: TextFieldName, label: string, autoComplete: string): ReactNode => {
    const error = errors[name]?.message

    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input
          {...form.register(name)}
          id={name}
          type={name === "email" ? "email" : "text"}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {error ? <FieldError id={`${name}-error`}>{error}</FieldError> : null}
      </Field>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* `post`: before hydration the browser submits natively, and a GET puts the password in the URL. */}
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("firstName", "First name", "given-name")}
          {textField("lastName", "Last name", "family-name")}
        </div>
        {textField("username", "Username", "username")}
        {textField("email", "Email", "email")}
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            {...form.register("password", { deps: ["confirmPassword"] })}
            password={newPassword}
            capsLockHint="Caps Lock is on"
          />
          {errors.password ? (
            <FieldError id="password-error">{errors.password.message}</FieldError>
          ) : null}
          <PasswordStrength
            strength={newPassword.strength}
            strengthProps={newPassword.strengthProps}
          />
        </Field>
        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <PasswordInput
            {...form.register("confirmPassword")}
            password={confirm}
            capsLockHint="Caps Lock is on"
          />
          {errors.confirmPassword ? (
            <FieldError id="confirmPassword-error">{errors.confirmPassword.message}</FieldError>
          ) : null}
        </Field>
        {errors.root?.server ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.root.server.message}
          </p>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <AuthLink
          href={LOGIN_ROUTE}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Sign in
        </AuthLink>
      </p>
    </div>
  )
}
