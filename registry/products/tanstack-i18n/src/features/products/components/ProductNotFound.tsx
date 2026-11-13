import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import { ProductBackLink } from "@/features/products/components/ProductBackLink"
import * as m from "@/paraglide/messages"

/**
 * A product that does not exist, with the way back to the list: the detail page's own state, and
 * the page the framework shows with the 404 status.
 */
export function ProductNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{m.products_not_found_title()}</EmptyTitle>
        <EmptyDescription>{m.products_not_found_description()}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ProductBackLink />
      </EmptyContent>
    </Empty>
  )
}
