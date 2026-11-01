"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import type { Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/features/users/helpers/get-error-message"
import { useAddUser } from "@/features/users/hooks/use-add-user"
import { addUserSchema } from "@/features/users/schemas/user.schema"
import type { AddUserInput } from "@/features/users/schemas/user.schema"

export function AddUserForm() {
  const addUser = useAddUser()
  const form = useForm<AddUserInput>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { firstName: "", lastName: "", email: "" }
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await addUser.mutateAsync(values)
    } catch (error) {
      form.setError("root.server", { message: getErrorMessage(error) })
    }
  })

  if (addUser.data) {
    const { id, firstName, lastName, email } = addUser.data

    return (
      <div role="status" className="flex flex-col gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">The API returned user #{id}</p>
          <p className="mt-1 font-medium">
            {firstName} {lastName}
          </p>
          <p className="text-sm break-all text-muted-foreground">{email}</p>
        </div>
        <p className="rounded-lg bg-muted p-4 text-sm">
          <strong className="font-medium">This user was not saved.</strong> DummyJSON is a demo API:
          it returns the new user but does not store it, so the user will not appear in the list.
        </p>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            addUser.reset()
            form.reset()
          }}
        >
          Add another user
        </Button>
      </div>
    )
  }

  const serverError = form.formState.errors.root?.server?.message

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextField control={form.control} name="firstName" label="First name" />
      <TextField control={form.control} name="lastName" label="Last name" />
      <TextField control={form.control} name="email" label="Email" type="email" />
      {serverError && (
        <p role="alert" className="text-sm text-destructive">
          Could not add the user. {serverError}
        </p>
      )}
      <Button type="submit" className="self-start" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Adding…" : "Add user"}
      </Button>
    </form>
  )
}

type TextFieldProps = {
  control: Control<AddUserInput>
  name: keyof AddUserInput
  label: string
  type?: "text" | "email"
}

function TextField({ control, name, label, type = "text" }: TextFieldProps) {
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
            type={type}
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
