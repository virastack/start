"use client"

import { useId } from "react"

import { CartSummaryDetails } from "@/features/cart/components/CartSummaryDetails"
import type { Cart } from "@/features/cart/schemas/cart.schema"

/** The summary beside the lines. On phones the bar at the bottom shows it instead. */
export function CartSummary({ cart }: { cart: Cart }) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="hidden flex-col gap-4 rounded-lg border p-4 md:sticky md:top-6 md:flex"
    >
      <h2 id={titleId} className="text-lg font-semibold tracking-tight">
        Order summary
      </h2>
      <CartSummaryDetails cart={cart} />
    </section>
  )
}
