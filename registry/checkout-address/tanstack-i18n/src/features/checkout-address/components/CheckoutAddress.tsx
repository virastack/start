"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AddressSummary } from "@/features/checkout-address/components/AddressSummary"
import { useAddresses } from "@/features/checkout-address/hooks/use-addresses"
import { useCheckoutAddress } from "@/features/checkout-address/hooks/use-checkout-address"
import { useAddressSelectionStore } from "@/features/checkout-address/stores/address-selection.store"
import * as m from "@/paraglide/messages.js"

export function CheckoutAddress() {
  const addresses = useAddresses()
  const { shipping, billing, isBillingSameAsShipping } = useCheckoutAddress()
  const { setShippingId, setBillingId, setIsBillingSameAsShipping } = useAddressSelectionStore()

  if (addresses.isPending) {
    return (
      <div role="status" aria-label={m.checkout_address_loading()}>
        <Skeleton className="h-28 w-full" />
      </div>
    )
  }

  if (addresses.isError) {
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border p-4">
        <p className="text-sm">{m.checkout_address_load_error()}</p>
        <Button variant="outline" onClick={() => addresses.refetch()}>
          {m.checkout_address_retry()}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <AddressSummary
        type="shipping"
        title={m.checkout_address_shipping_title()}
        addresses={addresses.data}
        selected={shipping}
        onSelect={setShippingId}
      />

      <Label className="flex items-center gap-2 font-normal">
        <Checkbox
          checked={isBillingSameAsShipping}
          onCheckedChange={(isChecked) => setIsBillingSameAsShipping(isChecked)}
        />
        {m.checkout_address_same_billing()}
      </Label>

      {isBillingSameAsShipping ? null : (
        <AddressSummary
          type="billing"
          title={m.checkout_address_billing_title()}
          addresses={addresses.data}
          selected={billing}
          onSelect={setBillingId}
        />
      )}
    </div>
  )
}
