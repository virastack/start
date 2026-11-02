import { formatAddress } from "@virastack/address"
import { createMask } from "@virastack/mask"

import { Badge } from "@/components/ui/badge"
import { PHONE_MASKS } from "@/features/checkout-address/constants/addresses.constants"
import type { Address } from "@/features/checkout-address/schemas/address.schema"

const phoneMask = createMask(PHONE_MASKS.phone)

export function AddressDetails({ address }: { address: Address }) {
  return (
    <span className="flex min-w-0 flex-col gap-1 text-sm">
      <span className="flex flex-wrap items-center gap-2 font-medium">
        {address.addressName}
        {address.isDefault ? <Badge variant="secondary">Default</Badge> : null}
      </span>
      <span>
        {address.firstName} {address.lastName} · {phoneMask.format(address.phone)}
      </span>
      <span className="text-pretty text-muted-foreground">
        {address.addressLine}, {formatAddress(address, { postalCode: true })}
      </span>
    </span>
  )
}
