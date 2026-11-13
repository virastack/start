import { Trash2Icon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CartImage } from "@/features/cart/components/CartImage"
import { CartLink } from "@/features/cart/components/CartLink"
import { QuantitySelect } from "@/features/cart/components/QuantitySelect"
import { QuantityStepper } from "@/features/cart/components/QuantityStepper"
import { getProductHref } from "@/features/cart/helpers/product-href"
import { useCartFormat } from "@/features/cart/hooks/use-cart-format"
import type { CartItem as CartItemData } from "@/features/cart/schemas/cart.schema"
import * as m from "@/paraglide/messages"

type CartItemProps = {
  item: CartItemData
  isBusy: boolean
  onSelectedChange: (selected: boolean) => void
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

/** A line shows what it costs in all, for its quantity; the unit prices are on the product's page. */
export function CartItem({
  item,
  isBusy,
  onSelectedChange,
  onQuantityChange,
  onRemove
}: CartItemProps) {
  const format = useCartFormat()
  const href = getProductHref(item.id)

  return (
    <li className="flex items-center gap-3 py-4 sm:gap-4">
      <Checkbox
        aria-label={m.cart_select_item({ title: item.title })}
        checked={item.selected}
        disabled={isBusy}
        onCheckedChange={onSelectedChange}
      />
      {/* The title links to the same page, so screen readers and Tab meet one link per line. */}
      <CartLink
        href={href}
        tabIndex={-1}
        aria-hidden
        className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted/50 sm:size-24"
      >
        <CartImage src={item.thumbnail} />
      </CartLink>
      {/*
        As tall as the image: the name lines up with its top and the quantity with its bottom.
        A narrow list puts the remove button beside the name and the price beside a quantity
        list; a wide one has the stepper, with the price centered on the right.
      */}
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] content-between gap-x-3 gap-y-3 self-stretch @md:grid-cols-[auto_auto_minmax(0,1fr)_auto] @md:items-center">
        <h3 className="col-start-1 row-start-1 line-clamp-2 self-start text-sm font-medium @md:col-span-3">
          <CartLink href={href} className="hover:underline">
            {item.title}
          </CartLink>
        </h3>
        <QuantityStepper
          className="col-start-1 row-start-2 hidden @md:flex"
          value={item.quantity}
          max={item.maxQuantity}
          label={item.title}
          isBusy={isBusy}
          onChange={onQuantityChange}
          onRemove={onRemove}
        />
        <QuantitySelect
          className="col-start-1 row-start-2 self-end @md:hidden"
          value={item.quantity}
          max={item.maxQuantity}
          label={item.title}
          isBusy={isBusy}
          onChange={onQuantityChange}
        />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "col-start-2 row-start-1 -mt-1.5 -mr-2 self-start justify-self-end text-muted-foreground hover:text-destructive @md:row-start-2 @md:m-0 @md:self-center @md:justify-self-start data-disabled:opacity-50 data-disabled:hover:text-muted-foreground",
            // At one, the stepper's own button removes the line on a wide list.
            item.quantity <= 1 && "@md:hidden"
          )}
          aria-label={m.cart_remove_item({ title: item.title })}
          disabled={isBusy}
          focusableWhenDisabled
          onClick={onRemove}
        >
          <Trash2Icon aria-hidden />
        </Button>
        <p className="col-start-2 row-start-2 self-end justify-self-end font-semibold tabular-nums @md:col-start-4 @md:row-span-2 @md:row-start-1 @md:self-center">
          {format.price(item.total)}
        </p>
      </div>
    </li>
  )
}
