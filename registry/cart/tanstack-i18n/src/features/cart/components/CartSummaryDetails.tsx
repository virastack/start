"use client"

import { useState } from "react"
import type { ReactNode } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckoutButton } from "@/features/cart/components/CheckoutButton"
import { CouponForm } from "@/features/cart/components/CouponForm"
import { useCartFormat } from "@/features/cart/hooks/use-cart-format"
import { useIsCartBusy, useRemoveCoupon } from "@/features/cart/hooks/use-cart-mutations"
import type { Cart } from "@/features/cart/schemas/cart.schema"
import * as m from "@/paraglide/messages"

export function CartSummaryDetails({ cart }: { cart: Cart }) {
  const format = useCartFormat()
  const removeCoupon = useRemoveCoupon()
  const isBusy = useIsCartBusy()
  const { totals } = cart
  // Applying or removing a coupon swaps the form and the button, so the one that appears takes
  // the focus. On the first render neither does.
  const [hasCouponChanged, setHasCouponChanged] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <dl className="flex flex-col gap-2 text-sm">
        <SummaryRow
          term={m.cart_subtotal({ count: totals.quantity })}
          value={format.price(totals.subtotal)}
        />
        {totals.productDiscount > 0 && (
          <SummaryRow
            term={m.cart_product_discount()}
            value={format.price(-totals.productDiscount)}
          />
        )}
        {cart.coupon && (
          <SummaryRow
            term={m.cart_coupon_row({ code: cart.coupon.code })}
            value={format.price(-totals.couponDiscount)}
          />
        )}
      </dl>
      {cart.coupon ? (
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start p-0"
          aria-label={m.cart_remove_coupon_label({ code: cart.coupon.code })}
          autoFocus={hasCouponChanged}
          disabled={isBusy}
          focusableWhenDisabled
          onClick={() =>
            removeCoupon.mutate(cart, {
              onSuccess: () => setHasCouponChanged(true),
              onError: () => toast.error(m.cart_remove_coupon_error())
            })
          }
        >
          {m.cart_remove_coupon()}
        </Button>
      ) : (
        <CouponForm
          cart={cart}
          autoFocus={hasCouponChanged}
          onApplied={() => setHasCouponChanged(true)}
        />
      )}
      <Separator />
      <p className="flex items-baseline justify-between gap-4 font-semibold">
        <span>{m.cart_total()}</span>
        <span className="text-lg tabular-nums">{format.price(totals.total)}</span>
      </p>
      <CheckoutButton className="w-full" disabled={isBusy || totals.quantity === 0} />
      {totals.quantity === 0 && (
        <p className="text-sm text-muted-foreground">{m.cart_none_selected()}</p>
      )}
      <p className="text-xs text-muted-foreground">{m.cart_shipping_note()}</p>
    </div>
  )
}

function SummaryRow({ term, value }: { term: ReactNode; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}
