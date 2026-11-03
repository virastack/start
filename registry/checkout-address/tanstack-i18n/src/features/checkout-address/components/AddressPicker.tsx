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
import { AddressDetails } from "@/features/checkout-address/components/AddressDetails"
import { AddressForm } from "@/features/checkout-address/components/AddressForm"
import type { Address, AddressType } from "@/features/checkout-address/schemas/address.schema"
import * as m from "@/paraglide/messages.js"

type AddressPickerProps = {
  type: AddressType
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  addresses: Address[]
  selectedId: number | null
  onSelect: (id: number) => void
}

export function AddressPicker({ isOpen, onOpenChange, ...props }: AddressPickerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-lg">
        {/* Mounted only while open, so each opening starts from the chosen address. */}
        <AddressPickerContent {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

type AddressPickerContentProps = Omit<AddressPickerProps, "isOpen" | "onOpenChange"> & {
  onClose: () => void
}

function AddressPickerContent({
  type,
  addresses,
  selectedId,
  onSelect,
  onClose
}: AddressPickerContentProps) {
  const [draftId, setDraftId] = useState(selectedId)
  /** `undefined` shows the list, `null` an empty form, an address the filled form. */
  const [formTarget, setFormTarget] = useState<Address | null | undefined>(
    addresses.length === 0 ? null : undefined
  )

  if (formTarget !== undefined) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>
            {formTarget
              ? m.checkout_address_form_edit_title()
              : m.checkout_address_form_add_title()}
          </DialogTitle>
          <DialogDescription>{m.checkout_address_dialog_description()}</DialogDescription>
        </DialogHeader>
        {addresses.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="justify-self-start"
            onClick={() => setFormTarget(undefined)}
          >
            <ArrowLeftIcon aria-hidden />
            {m.checkout_address_back()}
          </Button>
        ) : null}
        <AddressForm
          key={formTarget?.id ?? "new"}
          type={type}
          address={formTarget}
          onSaved={(saved) => {
            if (formTarget) {
              setDraftId(saved.id)
              setFormTarget(undefined)
            } else {
              onSelect(saved.id)
              onClose()
            }
          }}
        />
      </>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{m.checkout_address_picker_title()}</DialogTitle>
      </DialogHeader>
      <RadioGroup
        aria-label={m.checkout_address_picker_title()}
        value={String(draftId)}
        onValueChange={(value) => setDraftId(Number(value))}
      >
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start gap-3 rounded-lg border p-4 has-data-checked:border-foreground/40 has-data-checked:bg-muted/40"
          >
            <Label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 font-normal">
              <RadioGroupItem value={String(address.id)} className="mt-0.5" />
              <AddressDetails address={address} />
            </Label>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0"
              aria-label={m.checkout_address_edit_label({ title: address.addressName })}
              onClick={() => setFormTarget(address)}
            >
              {m.checkout_address_edit()}
            </Button>
          </div>
        ))}
      </RadioGroup>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" onClick={() => setFormTarget(null)}>
          <PlusIcon aria-hidden />
          {m.checkout_address_add_new()}
        </Button>
        <Button
          disabled={draftId === null}
          onClick={() => {
            if (draftId !== null) onSelect(draftId)
            onClose()
          }}
        >
          {m.checkout_address_use_address()}
        </Button>
      </div>
    </>
  )
}
