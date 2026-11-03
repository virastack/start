"use client"

import { useState } from "react"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { AddressDetails } from "@/features/checkout-address/components/AddressDetails"
import { AddressPicker } from "@/features/checkout-address/components/AddressPicker"
import type { Address, AddressType } from "@/features/checkout-address/schemas/address.schema"

type AddressSummaryProps = {
  type: AddressType
  title: string
  addresses: Address[]
  selected: Address | null
  onSelect: (id: number) => void
}

/** Only the chosen address shows on the page; the rest wait in the picker. */
export function AddressSummary({
  type,
  title,
  addresses,
  selected,
  onSelect
}: AddressSummaryProps) {
  const t = useTranslations("CheckoutAddress")
  const [isPickerOpen, setIsPickerOpen] = useState(false)

  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-3">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <div className="flex items-start justify-between gap-3 rounded-lg border p-4">
        {selected ? (
          <AddressDetails address={selected} />
        ) : (
          <p className="text-sm text-muted-foreground">{t("no_address")}</p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          aria-label={
            selected ? t("change_label", { title: title }) : t("add_label", { title: title })
          }
          onClick={() => setIsPickerOpen(true)}
        >
          {selected ? t("change") : t("add")}
        </Button>
      </div>
      <AddressPicker
        type={type}
        isOpen={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        addresses={addresses}
        selectedId={selected?.id ?? null}
        onSelect={onSelect}
      />
    </section>
  )
}
