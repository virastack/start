"use client"

import { useState } from "react"
import type { ReactNode } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckoutButton } from "@/features/cart/components/CheckoutButton"
import { CouponForm } from "@/features/cart/components/CouponForm"
import { formatPrice } from "@/features/cart/helpers/price"
import { useIsCartBusy, useRemoveCoupon } from "@/features/cart/hooks/use-cart-mutations"
import type { Cart } from "@/features/cart/schemas/cart.schema"

export function CartSummaryDetails({ cart }: { cart: Cart }) {
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
          term={totals.quantity === 1 ? "Subtotal (1 item)" : `Subtotal (${totals.quantity} items)`}
          value={formatPrice(totals.subtotal)}
        />
        {totals.productDiscount > 0 && (
          <SummaryRow term="Product discount" value={formatPrice(-totals.productDiscount)} />
        )}
        {cart.coupon && (
          <SummaryRow
            term={`Coupon ${cart.coupon.code}`}
            value={formatPrice(-totals.couponDiscount)}
          />
        )}
      </dl>
      {cart.coupon ? (
        <Button
          variant="link"
          size="sm"
          className="h-auto self-start p-0"
          aria-label={`Remove coupon ${cart.coupon.code}`}
          autoFocus={hasCouponChanged}
          disabled={isBusy}
          focusableWhenDisabled
          onClick={() =>
            removeCoupon.mutate(cart, {
              onSuccess: () => setHasCouponChanged(true),
              onError: () => toast.error("Could not remove the coupon. Try again.")
            })
          }
        >
          Remove coupon
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
        <span>Total</span>
        <span className="text-lg tabular-nums">{formatPrice(totals.total)}</span>
      </p>
      <CheckoutButton className="w-full" disabled={isBusy || totals.quantity === 0} />
      {totals.quantity === 0 && (
        <p className="text-sm text-muted-foreground">Select the products you want to check out.</p>
      )}
      <p className="text-xs text-muted-foreground">
        Shipping and taxes are calculated at checkout.
      </p>
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
