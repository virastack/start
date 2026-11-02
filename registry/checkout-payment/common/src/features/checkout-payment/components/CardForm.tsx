"use client"

import type { ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { maskResolver, useViraMask } from "@virastack/mask"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CARD_MASKS } from "@/features/checkout-payment/constants/cards.constants"
import { useAddCard } from "@/features/checkout-payment/hooks/use-add-card"
import { cardFormSchema } from "@/features/checkout-payment/schemas/card.schema"
import type { CardFormInput, SavedCard } from "@/features/checkout-payment/schemas/card.schema"

/** The mask reports a key such as `card.invalid`, for the form to word. Others are the schema's. */
function wordMaskError(message: string | undefined, maskMessage: string) {
  return message && /^[a-z]+\.[a-zA-Z]+$/.test(message) ? maskMessage : message
}

export function CardForm({ onSaved }: { onSaved: (saved: SavedCard) => void }) {
  const addCard = useAddCard()
  const form = useForm<CardFormInput>({
    resolver: maskResolver(CARD_MASKS, zodResolver(cardFormSchema)),
    defaultValues: { cardNumber: "", holderName: "", expiry: "", cvv: "" }
  })
  const { cardNumber, expiry, cvv } = useViraMask(form, CARD_MASKS)
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      onSaved(await addCard.mutateAsync(input))
    } catch {
      form.setError("root.server", { message: "Could not save the card. Try again." })
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        name="cardNumber"
        label={"Card number"}
        error={wordMaskError(errors.cardNumber?.message, "Check the card number")}
      >
        <Input
          {...cardNumber}
          id="cardNumber"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          aria-invalid={Boolean(errors.cardNumber)}
        />
      </FormField>
      <FormField name="holderName" label={"Name on card"} error={errors.holderName?.message}>
        <Input
          id="holderName"
          autoComplete="cc-name"
          aria-invalid={Boolean(errors.holderName)}
          {...form.register("holderName")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="expiry"
          label={"Expiry (MM/YY)"}
          error={wordMaskError(errors.expiry?.message, "Enter a valid future date")}
        >
          <Input
            {...expiry}
            id="expiry"
            autoComplete="cc-exp"
            placeholder="12/30"
            aria-invalid={Boolean(errors.expiry)}
          />
        </FormField>
        <FormField
          name="cvv"
          label={"CVV"}
          error={wordMaskError(errors.cvv?.message, "Check the CVV")}
        >
          <Input
            {...cvv}
            id="cvv"
            autoComplete="cc-csc"
            placeholder="123"
            aria-invalid={Boolean(errors.cvv)}
          />
        </FormField>
      </div>
      {errors.root?.server ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.server.message}
        </p>
      ) : null}
      <Button type="submit" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Save card"}
      </Button>
    </form>
  )
}

type FormFieldProps = {
  name: string
  label: string
  error?: string
  children: ReactNode
}

function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      {children}
      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}
