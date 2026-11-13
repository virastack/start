import type { QueryClient } from "@tanstack/react-query"
import { notFound } from "@tanstack/react-router"

import {
  categoriesQueryOptions,
  productQueryOptions,
  productsQueryOptions,
  toQueryFilters
} from "@/features/products/api/product.queries"
import { isNotFoundError } from "@/features/products/helpers/get-error-message"
import type { ProductsFilters } from "@/features/products/schemas/product-list-params.schema"
import { productIdSchema } from "@/features/products/schemas/product.schema"

/**
 * The list page's `loader`: the page the URL asks for and the categories, into the router's
 * QueryClient, where the list reads them. `wait: false` starts the requests without holding the
 * navigation, so on the client a new page, filter or sort keeps the page on screen while it
 * loads. A failed request is left to the list, which shows its error state. Returns what the
 * cache has by then, for the page's title and description.
 */
export async function loadProductList(
  queryClient: QueryClient,
  filters: ProductsFilters,
  { wait = true }: { wait?: boolean } = {}
) {
  const requests = Promise.all([
    queryClient.ensureQueryData(productsQueryOptions(toQueryFilters(filters))),
    queryClient.ensureQueryData(categoriesQueryOptions())
  ]).then(
    () => undefined,
    () => undefined
  )
  if (wait) await requests
  return {
    data: queryClient.getQueryData(productsQueryOptions(toQueryFilters(filters)).queryKey) ?? null,
    categories: queryClient.getQueryData(categoriesQueryOptions().queryKey) ?? null
  }
}

/**
 * The product page's `loader`. A path that is not a product id, or a product the API does not
 * have, is the router's `notFound()`, which answers 404. Any other failure leaves the product to
 * the client, which shows its error state and retries.
 */
export async function loadProduct(queryClient: QueryClient, id: string) {
  const result = productIdSchema.safeParse(id)
  if (!result.success) throw notFound()
  try {
    return await queryClient.ensureQueryData(productQueryOptions(result.data))
  } catch (error) {
    if (isNotFoundError(error)) throw notFound()
    return undefined
  }
}
