import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type { QueryKey } from "@tanstack/react-query"

import { getCategories } from "@/features/products/api/get-categories.api"
import { getProduct } from "@/features/products/api/get-product.api"
import { getProducts } from "@/features/products/api/get-products.api"
import { productKeys } from "@/features/products/api/query-keys"
import { PRODUCTS_STALE_TIME } from "@/features/products/constants/products.constants"
import type { ProductsFilters } from "@/features/products/schemas/product-list-params.schema"
import type {
  ProductCategory,
  ProductDetails,
  ProductsPage
} from "@/features/products/schemas/product.schema"

/** What the server fetched for the first paint: one page of the list, and the categories. */
export type InitialProducts = {
  queryKey: QueryKey
  /** `null` when the request failed, so the client fetches it. */
  data: ProductsPage | null
  categories: ProductCategory[] | null
  updatedAt: number
}

/** What the server fetched for a product's page. `notFound` lets the page answer with a 404. */
export type InitialProduct = {
  product: ProductDetails | null
  notFound: boolean
  updatedAt: number
}

/** A search ignores the category, so both share one cache entry and one request. */
export function toQueryFilters({ q, category, sort, page }: ProductsFilters): ProductsFilters {
  const search = q.trim()
  return { q: search, category: search ? "" : category, sort, page }
}

export const productsQueryOptions = (params: ProductsFilters) => {
  const filters = toQueryFilters(params)

  return queryOptions({
    queryKey: productKeys.list(filters),
    queryFn: ({ signal }) => getProducts(filters, signal),
    // The page on screen stays, dimmed, while the next one loads.
    placeholderData: keepPreviousData,
    staleTime: PRODUCTS_STALE_TIME
  })
}

export const categoriesQueryOptions = () =>
  queryOptions({
    queryKey: productKeys.categories(),
    queryFn: ({ signal }) => getCategories(signal),
    // The category list barely changes, so one request per visit is enough.
    staleTime: Infinity
  })

export const productQueryOptions = (id: number) =>
  queryOptions({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => getProduct(id, signal),
    staleTime: PRODUCTS_STALE_TIME
  })
