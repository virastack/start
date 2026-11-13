"use client"

import { useId } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CouponError } from "@/features/cart/api/coupon.api"
import { useApplyCoupon, useIsCartBusy } from "@/features/cart/hooks/use-cart-mutations"
import type { Cart } from "@/features/cart/schemas/cart.schema"
import { createCouponFormSchema } from "@/features/cart/schemas/coupon.schema"
import type { CouponFormInput } from "@/features/cart/schemas/coupon.schema"

type CouponFormProps = {
  cart: Cart
  /** Focuses the field when the form appears, after a coupon was removed. */
  autoFocus?: boolean
  onApplied: () => void
}

export function CouponForm({ cart, autoFocus = false, onApplied }: CouponFormProps) {
  const t = useTranslations("Cart")
  const applyCoupon = useApplyCoupon()
  // The summary and the drawer on phones can both hold the form.
  const fieldId = useId()
  const isBusy = useIsCartBusy()
  const form = useForm<CouponFormInput>({
    resolver: zodResolver(
      createCouponFormSchema({ required: t("coupon_required"), tooLong: t("coupon_too_long") })
    ),
    defaultValues: { code: "" }
  })
  const error = form.formState.errors.code?.message

  const onSubmit = form.handleSubmit(async ({ code }) => {
    try {
      await applyCoupon.mutateAsync({ cart, code })
      onApplied()
    } catch (failure) {
      form.setError(
        "code",
        {
          message: failure instanceof CouponError ? t("coupon_invalid") : t("coupon_error")
        },
        { shouldFocus: true }
      )
    }
  })

  return (
    <form onSubmit={onSubmit} noValidate>
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={fieldId}>{t("coupon_label")}</FieldLabel>
        <div className="flex gap-2">
          <Input
            {...form.register("code")}
            id={fieldId}
            autoFocus={autoFocus}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="WELCOME10"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : undefined}
          />
          <Button
            type="submit"
            variant="outline"
            className="shrink-0"
            disabled={isBusy}
            focusableWhenDisabled
          >
            {applyCoupon.isPending ? t("applying") : t("apply")}
          </Button>
        </div>
        {error ? <FieldError id={`${fieldId}-error`}>{error}</FieldError> : null}
      </Field>
    </form>
  )
}
