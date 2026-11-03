"use client"

import { useState } from "react"

import { ArrowLeftIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CardDetails } from "@/features/checkout-card/components/CardDetails"
import { CardForm } from "@/features/checkout-card/components/CardForm"
import type { SavedCard } from "@/features/checkout-card/schemas/card.schema"

type CardPickerProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  cards: SavedCard[]
  selectedToken: string | null
  onSelect: (token: string) => void
}

export function CardPicker({ isOpen, onOpenChange, ...props }: CardPickerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-lg">
        {/* Mounted only while open, so card details never outlive the dialog. */}
        <CardPickerContent {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

type CardPickerContentProps = Omit<CardPickerProps, "isOpen" | "onOpenChange"> & {
  onClose: () => void
}

/** A saved card has no edit: its number is gone, so a changed card is a new card. */
function CardPickerContent({ cards, selectedToken, onSelect, onClose }: CardPickerContentProps) {
  const [draftToken, setDraftToken] = useState(selectedToken)
  const [isAdding, setIsAdding] = useState(cards.length === 0)

  if (isAdding) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Add new card</DialogTitle>
          <DialogDescription>
            The card number and CVV never leave this browser. The request carries a dummy token, the
            brand, the last four digits, the expiry and the name on the card.
          </DialogDescription>
        </DialogHeader>
        {cards.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="justify-self-start"
            onClick={() => setIsAdding(false)}
          >
            <ArrowLeftIcon aria-hidden />
            Back to cards
          </Button>
        ) : null}
        <CardForm
          onSaved={(saved) => {
            onSelect(saved.cardToken)
            onClose()
          }}
        />
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Choose a card</DialogTitle>
      </DialogHeader>
      <RadioGroup
        aria-label={"Choose a card"}
        value={draftToken ?? ""}
        onValueChange={(value) => setDraftToken(String(value))}
      >
        {cards.map((card) => (
          <Label
            key={card.cardToken}
            className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal has-data-checked:border-foreground/40 has-data-checked:bg-muted/40"
          >
            <RadioGroupItem value={card.cardToken} className="mt-0.5" />
            <CardDetails card={card} />
          </Label>
        ))}
      </RadioGroup>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" onClick={() => setIsAdding(true)}>
          <PlusIcon aria-hidden />
          Add new card
        </Button>
        <Button
          disabled={draftToken === null}
          onClick={() => {
            if (draftToken !== null) onSelect(draftToken)
            onClose()
          }}
        >
          Use this card
        </Button>
      </div>
    </>
  )
}
