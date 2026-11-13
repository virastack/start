import type { ComponentProps } from "react"
import Link from "next/link"

import { PRODUCTS_ROUTE } from "@/features/products/constants/products.constants"
import { getProductHref } from "@/features/products/helpers/product-href"

type ProductLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** The product's page; without it, the list. */
  productId?: number
}

/** The framework's link, so moving between the list and a product stays a client navigation. */
export function ProductLink({ productId, ...props }: ProductLinkProps) {
  return (
    <Link href={productId === undefined ? PRODUCTS_ROUTE : getProductHref(productId)} {...props} />
  )
}
