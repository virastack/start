import { BRAND_NAMES } from "@/features/checkout-card/constants/cards.constants"
import type { SavedCard } from "@/features/checkout-card/schemas/card.schema"

export function CardDetails({ card }: { card: SavedCard }) {
  // iyzico keeps "12" and "2030"; the card shows 12/30.
  const expiry = `${card.expireMonth}/${card.expireYear.slice(-2)}`

  return (
    <span className="flex min-w-0 flex-col gap-1 text-sm">
      <span className="font-medium">
        {card.cardBankName ? `${card.cardBankName} · ` : ""}
        {card.cardAssociation ? BRAND_NAMES[card.cardAssociation] : "Card"}
      </span>
      <span className="font-mono tabular-nums">•••• •••• •••• {card.lastFourDigits}</span>
      <span className="text-muted-foreground">
        {card.cardHolderName} · Expires {expiry}
      </span>
    </span>
  )
}
