import { ShoppingCartIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from "@/components/ui/empty"
import * as m from "@/paraglide/messages"

/** `autoFocus` moves the focus to its button, after the last line was removed. */
export function CartEmpty({ autoFocus = false }: { autoFocus?: boolean }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingCartIcon aria-hidden />
        </EmptyMedia>
        <EmptyTitle>{m.cart_empty_title()}</EmptyTitle>
        <EmptyDescription>{m.cart_empty_description()}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* No page to go to yet: wire it to your product list. */}
        <Button variant="outline" autoFocus={autoFocus}>
          {m.cart_browse_products()}
        </Button>
      </EmptyContent>
    </Empty>
  )
}
