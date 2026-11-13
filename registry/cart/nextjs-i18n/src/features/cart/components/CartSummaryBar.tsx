"use client"

import { ChevronUpIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer"
import { CartSummaryDetails } from "@/features/cart/components/CartSummaryDetails"
import { CheckoutButton } from "@/features/cart/components/CheckoutButton"
import { useCartFormat } from "@/features/cart/hooks/use-cart-format"
import { useIsCartBusy } from "@/features/cart/hooks/use-cart-mutations"
import type { Cart } from "@/features/cart/schemas/cart.schema"

/**
 * On phones the summary waits in a bar fixed to the bottom: the total and the checkout button.
 * The rest of the bar opens the whole summary in a drawer.
 */
export function CartSummaryBar({ cart }: { cart: Cart }) {
  const t = useTranslations("Cart")
  const format = useCartFormat()
  const { totals } = cart
  const isBusy = useIsCartBusy()

  return (
    <Drawer showSwipeHandle>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="relative flex items-center justify-between gap-4 px-4 py-3">
          {/* It covers the whole bar; the checkout button sits on top, so a tap there checks out. */}
          <DrawerTrigger
            aria-label={t("show_summary")}
            className="absolute inset-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset"
          />
          <p className="pointer-events-none flex flex-col">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {t("total")}
              <ChevronUpIcon aria-hidden className="size-3.5" />
            </span>
            <span className="text-lg font-semibold tabular-nums">{format.price(totals.total)}</span>
          </p>
          <CheckoutButton className="relative" disabled={isBusy || totals.quantity === 0} />
        </div>
      </div>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("summary_title")}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">
          <CartSummaryDetails cart={cart} />
        </div>
      </DrawerContent>
    </Drawer>
  )
}
