import type { ComponentProps } from "react"

import { PRODUCTS_ROUTE } from "@/features/products/constants/products.constants"
import { getProductHref } from "@/features/products/helpers/product-href"
import { Link } from "@/i18n/routing"

type ProductLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  /** The product's page; without it, the list. */
  productId?: number
}

/** next-intl's link: it adds the visitor's locale to the path and stays a client navigation. */
export function ProductLink({ productId, ...props }: ProductLinkProps) {
  return (
    <Link href={productId === undefined ? PRODUCTS_ROUTE : getProductHref(productId)} {...props} />
  )
}
