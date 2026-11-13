import { PRODUCTS_ROUTE } from "@/features/products/constants/products.constants"

export function getProductHref(id: number) {
  return `${PRODUCTS_ROUTE}/${id}`
}

/**
 * The list's canonical path: the category and the page are pages of their own, while a search or
 * a sort only shows the same products another way. Page 1 has no `page`.
 */
export function getProductsCanonicalHref({ category, page }: { category: string; page: number }) {
  const params = new URLSearchParams()
  if (category) params.set("category", category)
  if (page > 1) params.set("page", String(page))
  const search = params.toString()
  return search ? `${PRODUCTS_ROUTE}?${search}` : PRODUCTS_ROUTE
}
