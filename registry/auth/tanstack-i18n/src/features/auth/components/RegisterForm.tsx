"use client"

import { useState } from "react"
import type { ComponentProps, ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { maskResolver, useViraMask } from "@virastack/mask"
import { useViraPassword } from "@virastack/password"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthLink } from "@/features/auth/components/AuthLink"
import { PasswordInput } from "@/features/auth/components/PasswordInput"
import { PasswordStrength } from "@/features/auth/components/PasswordStrength"
import { RegisterSuccess } from "@/features/auth/components/RegisterSuccess"
import {
  LOGIN_ROUTE,
  PASSWORD_POLICY,
  REGISTER_MASKS
} from "@/features/auth/constants/auth.constants"
import { useRegister } from "@/features/auth/hooks/use-register"
import { registerFormSchema } from "@/features/auth/schemas/auth.schema"
import type { RegisteredUser, RegisterFormInput } from "@/features/auth/schemas/auth.schema"
import * as m from "@/paraglide/messages"

const EMPTY_VALUES: RegisterFormInput = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: ""
}

type TextFieldName = Exclude<keyof RegisterFormInput, "password" | "confirmPassword">

export function RegisterForm() {
  const registerAccount = useRegister()
  const [created, setCreated] = useState<RegisteredUser | null>(null)
  const form = useForm<RegisterFormInput>({
    resolver: maskResolver(REGISTER_MASKS, zodResolver(registerFormSchema)),
    defaultValues: EMPTY_VALUES
  })
  // The masks take the name and username fields; the password hook below takes the rest.
  const masked = useViraMask(form, REGISTER_MASKS)
  const { errors, isSubmitting } = form.formState
  // Bound to the form: values, `register()` and re-checking the confirmation come from it. Zod
  // still validates, with the same policy, since a resolver skips `register` rules.
  const { password, confirmPassword } = useViraPassword(form, {
    password: {
      policy: PASSWORD_POLICY,
      forbidden: ["firstName", "lastName", "username", "email"],
      btnProps: { "aria-label": m.auth_toggle_password() }
    },
    confirmPassword: { matchWith: "password", btnProps: { "aria-label": m.auth_toggle_password() } }
  })

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      setCreated(await registerAccount.mutateAsync(input))
      // The form stays mounted under the result, so the password leaves it now.
      form.reset(EMPTY_VALUES)
    } catch {
      form.setError("root.server", { message: m.auth_error_register() })
    } finally {
      // The mutation's variables hold the password: drop them once the answer is in.
      registerAccount.reset()
    }
  })

  if (created) return <RegisterSuccess user={created} onReset={() => setCreated(null)} />

  const textField = (
    name: TextFieldName,
    label: string,
    field: ComponentProps<typeof Input>
  ): ReactNode => {
    const error = errors[name]?.message

    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={name}>{label}</FieldLabel>
        <Input {...field} id={name} aria-describedby={error ? `${name}-error` : undefined} />
        {error ? <FieldError id={`${name}-error`}>{error}</FieldError> : null}
      </Field>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* `post`: before hydration the browser submits natively, and a GET puts the password in the URL. */}
      <form method="post" onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("firstName", m.auth_field_first_name(), masked.firstName)}
          {textField("lastName", m.auth_field_last_name(), masked.lastName)}
        </div>
        {textField("username", m.auth_field_username(), masked.username)}
        {textField("email", m.auth_field_email(), {
          ...form.register("email"),
          type: "email",
          autoComplete: "email",
          "aria-invalid": Boolean(errors.email)
        })}
        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor={password.inputProps.id}>{m.auth_field_password()}</FieldLabel>
          <PasswordInput
            password={password}
            errorId={errors.password && "password-error"}
            capsLockHint={m.auth_caps_lock()}
          />
          {errors.password ? (
            <FieldError id="password-error">{errors.password.message}</FieldError>
          ) : null}
          <PasswordStrength strength={password.strength} strengthProps={password.strengthProps} />
        </Field>
        <Field data-invalid={Boolean(errors.confirmPassword)}>
          <FieldLabel htmlFor={confirmPassword.inputProps.id}>
            {m.auth_field_confirm_password()}
          </FieldLabel>
          <PasswordInput
            password={confirmPassword}
            errorId={errors.confirmPassword && "confirmPassword-error"}
            capsLockHint={m.auth_caps_lock()}
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
          {isSubmitting ? m.auth_creating_account() : m.auth_create_account()}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {m.auth_have_account()}{" "}
        <AuthLink
          href={LOGIN_ROUTE}
          className="font-medium text-foreground underline underline-offset-4"
        >
          {m.auth_sign_in()}
        </AuthLink>
      </p>
    </div>
  )
}
