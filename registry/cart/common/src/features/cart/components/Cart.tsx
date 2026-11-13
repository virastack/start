"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import { CartEmpty } from "@/features/cart/components/CartEmpty"
import { CartItemList } from "@/features/cart/components/CartItemList"
import { CartSkeleton } from "@/features/cart/components/CartSkeleton"
import { CartSummary } from "@/features/cart/components/CartSummary"
import { CartSummaryBar } from "@/features/cart/components/CartSummaryBar"
import { useCart } from "@/features/cart/hooks/use-cart"

export function Cart() {
  const cart = useCart()
  const hasItems = (cart.data?.items.length ?? 0) > 0
  // Once the cart had lines, an empty one means the visitor removed the last: the empty state
  // takes the focus that left with it. A cart that loads empty leaves the focus alone.
  const [hadItems, setHadItems] = useState(false)
  if (hasItems && !hadItems) setHadItems(true)

  // A failed refetch keeps the cart on screen; the error state is only for a cart that never came.
  if (cart.data === undefined) {
    if (cart.isPending) return <CartSkeleton />
    return (
      <Empty role="alert" className="border">
        <EmptyHeader>
          <EmptyTitle>Could not load your cart</EmptyTitle>
          <EmptyDescription>Check your connection and try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" disabled={cart.isFetching} onClick={() => cart.refetch()}>
            {cart.isFetching ? "Retrying…" : "Retry"}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (!hasItems) return <CartEmpty autoFocus={hadItems} />

  return (
    // On phones the fixed bar covers the bottom, so the last line keeps room above it.
    <div className="grid gap-6 pb-24 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start md:pb-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <CartItemList cart={cart.data} />
      <CartSummary cart={cart.data} />
      <CartSummaryBar cart={cart.data} />
    </div>
  )
}
