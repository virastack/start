import { api } from "@/lib/api"

import {
  PRODUCT_FIELDS,
  PRODUCT_SORTS,
  PRODUCTS_PAGE_SIZE,
  PRODUCTS_PATH
} from "@/features/products/constants/products.constants"
import type { ProductsFilters } from "@/features/products/schemas/product-list-params.schema"
import { productsPageSchema } from "@/features/products/schemas/product.schema"
import type { ProductsPage } from "@/features/products/schemas/product.schema"

/** DummyJSON cannot search inside a category, so a search covers every category. */
function getPath({ q, category }: ProductsFilters) {
  if (q) return `${PRODUCTS_PATH}/search`
  if (category) return `${PRODUCTS_PATH}/category/${encodeURIComponent(category)}`
  return PRODUCTS_PATH
}

/** One page of the list, the first being `page: 1`. */
export function getProducts(filters: ProductsFilters, signal?: AbortSignal): Promise<ProductsPage> {
  const { sortBy, order } = PRODUCT_SORTS[filters.sort]

  return api.get(getPath(filters), {
    params: {
      limit: PRODUCTS_PAGE_SIZE,
      skip: (filters.page - 1) * PRODUCTS_PAGE_SIZE,
      q: filters.q || undefined,
      select: PRODUCT_FIELDS,
      sortBy,
      order
    },
    schema: productsPageSchema,
    signal
  })
}
