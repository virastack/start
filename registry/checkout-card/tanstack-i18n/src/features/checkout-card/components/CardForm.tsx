"use client"

import type { ReactNode } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { maskResolver, useViraMask } from "@virastack/mask"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CARD_MASKS } from "@/features/checkout-card/constants/cards.constants"
import { useAddCard } from "@/features/checkout-card/hooks/use-add-card"
import { cardFormSchema } from "@/features/checkout-card/schemas/card.schema"
import type { CardFormInput, SavedCard } from "@/features/checkout-card/schemas/card.schema"
import * as m from "@/paraglide/messages.js"

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
  const { holderName, cardNumber, expiry, cvv } = useViraMask(form, CARD_MASKS)
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async (input) => {
    try {
      onSaved(await addCard.mutateAsync(input))
    } catch {
      form.setError("root.server", { message: m.checkout_card_save_error() })
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormField
        name="holderName"
        label={m.checkout_card_field_holder()}
        error={errors.holderName?.message}
      >
        <Input
          {...holderName}
          id="holderName"
          autoComplete="cc-name"
          aria-invalid={Boolean(errors.holderName)}
          aria-describedby={errors.holderName ? "holderName-error" : undefined}
        />
      </FormField>
      <FormField
        name="cardNumber"
        label={m.checkout_card_field_number()}
        error={wordMaskError(errors.cardNumber?.message, m.checkout_card_error_number_invalid())}
      >
        <Input
          {...cardNumber}
          id="cardNumber"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          aria-invalid={Boolean(errors.cardNumber)}
          aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          name="expiry"
          label={m.checkout_card_field_expiry()}
          error={wordMaskError(errors.expiry?.message, m.checkout_card_error_expiry_invalid())}
        >
          <Input
            {...expiry}
            id="expiry"
            autoComplete="cc-exp"
            placeholder="12/30"
            aria-invalid={Boolean(errors.expiry)}
            aria-describedby={errors.expiry ? "expiry-error" : undefined}
          />
        </FormField>
        <FormField
          name="cvv"
          label={m.checkout_card_field_cvv()}
          error={wordMaskError(errors.cvv?.message, m.checkout_card_error_cvv_invalid())}
        >
          <Input
            {...cvv}
            id="cvv"
            autoComplete="cc-csc"
            placeholder="123"
            aria-invalid={Boolean(errors.cvv)}
            aria-describedby={errors.cvv ? "cvv-error" : undefined}
          />
        </FormField>
      </div>
      {errors.root?.server ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.root.server.message}
        </p>
      ) : null}
      <Button type="submit" className="self-start" disabled={isSubmitting}>
        {isSubmitting ? m.checkout_card_saving() : m.checkout_card_save()}
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
      {error ? <FieldError id={`${name}-error`}>{error}</FieldError> : null}
    </Field>
  )
}
