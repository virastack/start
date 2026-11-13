import { ArrowLeftIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { ProductLink } from "@/features/products/components/ProductLink"
import * as m from "@/paraglide/messages"

/** Back to the list, from a product or from a product that is not there. */
export function ProductBackLink() {
  return (
    <ProductLink className={buttonVariants({ variant: "ghost", size: "sm" })}>
      <ArrowLeftIcon aria-hidden />
      {m.products_all_products()}
    </ProductLink>
  )
}
