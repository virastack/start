import { createMask } from "@virastack/mask"

import { BRAND_NAMES, CARD_MASKS } from "@/features/checkout-payment/constants/cards.constants"
import type { SavedCard } from "@/features/checkout-payment/schemas/card.schema"
import * as m from "@/paraglide/messages.js"

const expiryMask = createMask(CARD_MASKS.expiry)

export function CardDetails({ card }: { card: SavedCard }) {
  return (
    <span className="flex min-w-0 flex-col gap-1 text-sm">
      <span className="font-medium">
        {card.bank ? `${card.bank} · ` : ""}
        {BRAND_NAMES[card.brand]}
      </span>
      <span className="font-mono tabular-nums">•••• •••• •••• {card.last4}</span>
      <span className="text-muted-foreground">
        {card.holderName} · {m.checkout_payment_expires()} {expiryMask.format(card.expiry)}
      </span>
    </span>
  )
}
