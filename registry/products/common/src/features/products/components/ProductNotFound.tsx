import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import { ProductBackLink } from "@/features/products/components/ProductBackLink"

/**
 * A product that does not exist, with the way back to the list: the detail page's own state, and
 * the page the framework shows with the 404 status.
 */
export function ProductNotFound() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>Product not found</EmptyTitle>
        <EmptyDescription>It may have been removed, or the link is wrong.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <ProductBackLink />
      </EmptyContent>
    </Empty>
  )
}
