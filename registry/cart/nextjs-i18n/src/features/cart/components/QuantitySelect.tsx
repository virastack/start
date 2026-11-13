import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"
import { useTranslations } from "next-intl"

type QuantitySelectProps = {
  value: number
  max: number
  /** The product's name, so each list on the page has its own label. */
  label: string
  isBusy: boolean
  onChange: (value: number) => void
  className?: string
}

/**
 * The quantity on a narrow list, where the stepper takes too much room: the browser's own select,
 * so phones open their native picker. It never offers zero; removing has its own button.
 */
export function QuantitySelect({
  value,
  max,
  label,
  isBusy,
  onChange,
  className
}: QuantitySelectProps) {
  const t = useTranslations("Cart")
  // A quantity above the limit, from an API that allows more, stays in the list.
  const options = Array.from({ length: Math.max(max, value) }, (_, index) => index + 1)

  return (
    <div className={cn("relative w-fit", className)}>
      <select
        aria-label={t("quantity_label", { title: label })}
        value={value}
        disabled={isBusy}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 appearance-none rounded-md border border-input bg-transparent py-1 pr-8 pl-3 text-sm tabular-nums shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDownIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}
