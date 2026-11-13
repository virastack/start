import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import * as m from "@/paraglide/messages"

type QuantityStepperProps = {
  value: number
  max: number
  /** The product's name, so each stepper on the page has its own label. */
  label: string
  /** While a change is on its way the buttons do nothing. */
  isBusy: boolean
  onChange: (value: number) => void
  onRemove: () => void
  className?: string
}

/**
 * The buttons stay focusable when they turn off, so a keyboard press that reaches the limit, or
 * waits for the cart, keeps the focus where it was.
 */
const STEP_CLASS_NAME = "data-disabled:cursor-not-allowed data-disabled:opacity-50"

/**
 * At one, the decrease button turns into the remove button. It stays the same element, so the
 * focus stays on it when the quantity reaches one.
 */
export function QuantityStepper({
  value,
  max,
  label,
  isBusy,
  onChange,
  onRemove,
  className
}: QuantityStepperProps) {
  const isLast = value <= 1

  return (
    <div
      role="group"
      aria-label={m.cart_quantity_label({ title: label })}
      className={cn("flex w-fit items-center rounded-md border", className)}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          STEP_CLASS_NAME,
          isLast &&
            "text-muted-foreground hover:text-destructive data-disabled:hover:text-muted-foreground"
        )}
        aria-label={isLast ? m.cart_remove_item({ title: label }) : m.cart_decrease()}
        disabled={isBusy}
        focusableWhenDisabled
        onClick={isLast ? onRemove : () => onChange(value - 1)}
      >
        {isLast ? <Trash2Icon aria-hidden /> : <MinusIcon aria-hidden />}
      </Button>
      <output aria-live="polite" className="min-w-8 text-center text-sm tabular-nums">
        {value}
      </output>
      <Button
        variant="ghost"
        size="icon"
        className={STEP_CLASS_NAME}
        aria-label={m.cart_increase()}
        disabled={isBusy || value >= max}
        focusableWhenDisabled
        onClick={() => onChange(value + 1)}
      >
        <PlusIcon aria-hidden />
      </Button>
    </div>
  )
}
