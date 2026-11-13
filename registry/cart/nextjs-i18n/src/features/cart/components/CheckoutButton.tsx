import type { ComponentProps } from "react"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"

type CheckoutButtonProps = Omit<ComponentProps<typeof Button>, "children">

/**
 * The summary and the bar on phones both show it. There is no page to go to yet: wire it to your
 * checkout step here.
 */
export function CheckoutButton(props: CheckoutButtonProps) {
  const t = useTranslations("Cart")
  return (
    <Button size="lg" focusableWhenDisabled {...props}>
      {t("checkout")}
    </Button>
  )
}
