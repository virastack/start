import type { SearchParams } from "nuqs/server"

import { getCategories } from "@/features/products/api/get-categories.api"
import { getProducts } from "@/features/products/api/get-products.api"
import { productsQueryOptions, toQueryFilters } from "@/features/products/api/product.queries"
import type { InitialProducts } from "@/features/products/api/product.queries"
import { loadProductListParams } from "@/features/products/schemas/product-list-params.schema"

/**
 * Fetches on the server what `ProductList` shows first: the page the URL asks for and the
 * categories. A request that fails gives `null`, and the client then fetches it itself.
 */
export async function getInitialProducts(
  searchParams: Promise<SearchParams>
): Promise<InitialProducts> {
  const filters = toQueryFilters(await loadProductListParams(searchParams))
  const [data, categories] = await Promise.all([
    getProducts(filters).catch(() => null),
    getCategories().catch(() => null)
  ])

  return {
    queryKey: productsQueryOptions(filters).queryKey,
    data,
    categories,
    updatedAt: Date.now()
  }
}
