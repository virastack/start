"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CardDetails } from "@/features/checkout-payment/components/CardDetails"
import { CardPicker } from "@/features/checkout-payment/components/CardPicker"
import { useCards } from "@/features/checkout-payment/hooks/use-cards"
import { useCheckoutPayment } from "@/features/checkout-payment/hooks/use-checkout-payment"
import { useCardSelectionStore } from "@/features/checkout-payment/stores/card-selection.store"
import * as m from "@/paraglide/messages.js"

/** Only the chosen card shows on the page; the rest wait in the picker. */
export function CheckoutPayment() {
  const cards = useCards()
  const { card } = useCheckoutPayment()
  const setSelectedId = useCardSelectionStore((state) => state.setSelectedId)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  if (cards.isPending) {
    return (
      <div role="status" aria-label={m.checkout_payment_loading()}>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (cards.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border p-4">
        <p className="text-sm">{m.checkout_payment_load_error()}</p>
        <Button variant="outline" onClick={() => cards.refetch()}>
          {m.checkout_payment_retry()}
        </Button>
      </div>
    )
  }

  return (
    <section aria-label={m.checkout_payment_title()} className="flex min-w-0 flex-col gap-3">
      <h3 className="text-lg font-semibold tracking-tight">{m.checkout_payment_title()}</h3>
      <div className="flex items-start justify-between gap-3 rounded-lg border p-4">
        {card ? (
          <CardDetails card={card} />
        ) : (
          <p className="text-sm text-muted-foreground">{m.checkout_payment_no_card()}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label={card ? m.checkout_payment_change_label() : undefined}
          onClick={() => setIsPickerOpen(true)}
        >
          {card ? m.checkout_payment_change() : m.checkout_payment_add()}
        </Button>
      </div>
      <CardPicker
        isOpen={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        cards={cards.data}
        selectedId={card?.id ?? null}
        onSelect={setSelectedId}
      />
    </section>
  )
}
