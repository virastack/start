"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { CardDetails } from "@/features/checkout-card/components/CardDetails"
import { CardPicker } from "@/features/checkout-card/components/CardPicker"
import { useCards } from "@/features/checkout-card/hooks/use-cards"
import { useCheckoutCard } from "@/features/checkout-card/hooks/use-checkout-card"
import { useCardSelectionStore } from "@/features/checkout-card/stores/card-selection.store"

/** Only the chosen card shows on the page; the rest wait in the picker. */
export function CheckoutCard() {
  const cards = useCards()
  const { card } = useCheckoutCard()
  const setSelectedToken = useCardSelectionStore((state) => state.setSelectedToken)
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  if (cards.isPending) {
    return (
      <div role="status" aria-label={"Loading cards"}>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (cards.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border p-4">
        <p className="text-sm">Could not load your cards</p>
        <Button variant="outline" onClick={() => cards.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <section aria-label={"Payment method"} className="flex min-w-0 flex-col gap-3">
      <h3 className="text-lg font-semibold tracking-tight">Payment method</h3>
      <div className="flex items-start justify-between gap-3 rounded-lg border p-4">
        {card ? (
          <CardDetails card={card} />
        ) : (
          <p className="text-sm text-muted-foreground">No saved card yet.</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label={card ? "Change payment method" : undefined}
          onClick={() => setIsPickerOpen(true)}
        >
          {card ? "Change" : "Add card"}
        </Button>
      </div>
      <CardPicker
        isOpen={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        cards={cards.data}
        selectedToken={card?.cardToken ?? null}
        onSelect={setSelectedToken}
      />
    </section>
  )
}
