import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"

type CheckoutButtonProps = Omit<ComponentProps<typeof Button>, "children">

/**
 * The summary and the bar on phones both show it. There is no page to go to yet: wire it to your
 * checkout step here.
 */
export function CheckoutButton(props: CheckoutButtonProps) {
  return (
    <Button size="lg" focusableWhenDisabled {...props}>
      Proceed to checkout
    </Button>
  )
}
