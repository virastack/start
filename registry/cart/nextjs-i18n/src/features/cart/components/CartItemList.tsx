"use client"

import { useId, useRef } from "react"

import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import { CartItem } from "@/features/cart/components/CartItem"
import {
  useIsCartBusy,
  useSelectCartItems,
  useUpdateCart
} from "@/features/cart/hooks/use-cart-mutations"
import type { Cart } from "@/features/cart/schemas/cart.schema"

export function CartItemList({ cart }: { cart: Cart }) {
  const t = useTranslations("Cart")
  const updateCart = useUpdateCart()
  const selectItems = useSelectCartItems()
  const isBusy = useIsCartBusy()
  const listRef = useRef<HTMLUListElement>(null)
  const titleId = useId()

  const update = (items: Cart["items"], onSuccess?: () => void) =>
    updateCart.mutate(
      { ...cart, items },
      { onSuccess, onError: () => toast.error(t("update_error")) }
    )

  const select = (itemIds: number[], selected: boolean) =>
    selectItems.mutate(
      { cart, itemIds, selected },
      { onError: () => toast.error(t("update_error")) }
    )
  const allSelected = cart.items.every((item) => item.selected)

  const remove = (item: Cart["items"][number]) =>
    update(
      cart.items.filter((line) => line.id !== item.id),
      () => {
        // The removed line took the focus with it, so it moves to the list.
        listRef.current?.focus()
        toast(t("item_removed", { title: item.title }))
      }
    )

  return (
    <div className="rounded-lg border">
      {/* The page has its h1 and the summary its h2, so the lines get one too, for headings. */}
      <h2 id={titleId} className="sr-only">
        {t("items_label")}
      </h2>
      <div className="border-b px-4 py-3">
        <label className="flex w-fit items-center gap-3 text-sm font-medium">
          <Checkbox
            checked={allSelected}
            disabled={isBusy}
            onCheckedChange={(selected) =>
              select(
                cart.items.map((item) => item.id),
                selected
              )
            }
          />
          {t("select_all")}
        </label>
      </div>
      <ul
        ref={listRef}
        tabIndex={-1}
        aria-labelledby={titleId}
        aria-busy={isBusy}
        className="@container flex flex-col divide-y px-4 outline-none"
      >
        {cart.items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            isBusy={isBusy}
            onSelectedChange={(selected) => select([item.id], selected)}
            onQuantityChange={(quantity) =>
              update(cart.items.map((line) => (line.id === item.id ? { ...line, quantity } : line)))
            }
            onRemove={() => remove(item)}
          />
        ))}
      </ul>
    </div>
  )
}
