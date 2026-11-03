"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import type { Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { getErrorMessage } from "@/features/users/helpers/get-error-message"
import { userFormSchema } from "@/features/users/schemas/user.schema"
import type { UserFormInput } from "@/features/users/schemas/user.schema"

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" }
]

type UserFormProps = {
  defaultValues: UserFormInput
  submitLabel: string
  submittingLabel: string
  errorLabel: string
  onSubmit: (input: UserFormInput) => Promise<unknown>
}

/** Adding and editing share this form. */
export function UserForm({
  defaultValues,
  submitLabel,
  submittingLabel,
  errorLabel,
  onSubmit
}: UserFormProps) {
  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormSchema),
    defaultValues
  })
  const serverError = form.formState.errors.root?.server?.message

  const handleSubmit = form.handleSubmit(async (input) => {
    try {
      await onSubmit(input)
    } catch (error) {
      form.setError("root.server", { message: getErrorMessage(error) })
    }
  })

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField control={form.control} name="firstName" label="First name" />
        <TextField control={form.control} name="lastName" label="Last name" />
      </div>
      <TextField control={form.control} name="username" label="Username" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField control={form.control} name="title" label="Position" />
        <TextField control={form.control} name="department" label="Department" />
      </div>
      <Controller
        name="role"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor="role">Role</FieldLabel>
            <Select items={ROLE_OPTIONS} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          {errorLabel} {serverError}
        </p>
      )}
      <Button type="submit" className="self-start" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  )
}

type TextFieldProps = {
  control: Control<UserFormInput>
  name: Exclude<keyof UserFormInput, "role">
  label: string
}

function TextField({ control, name, label }: TextFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            autoComplete="off"
            aria-invalid={fieldState.invalid}
            aria-describedby={fieldState.invalid ? `${field.name}-error` : undefined}
          />
          {fieldState.invalid && (
            <FieldError id={`${field.name}-error`} errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  )
}
