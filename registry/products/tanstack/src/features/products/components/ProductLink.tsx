import type { ComponentProps } from "react"

import { Link } from "@tanstack/react-router"

import { PRODUCTS_ROUTE } from "@/features/products/constants/products.constants"
import { getProductHref } from "@/features/products/helpers/product-href"

type ProductLinkProps = Omit<ComponentProps<typeof Link>, "to" | "params" | "search"> & {
  /** The product's page; without it, the list. */
  productId?: number
}

/**
 * The router's link, so moving between the list and a product stays a client navigation. The path
 * is a plain string, so it type-checks before the module's routes are in the route tree.
 */
export function ProductLink({ productId, ...props }: ProductLinkProps) {
  const to: string = productId === undefined ? PRODUCTS_ROUTE : getProductHref(productId)
  return <Link to={to} {...props} />
}
