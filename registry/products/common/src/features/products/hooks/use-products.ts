"use client"

import { hashKey, useQuery } from "@tanstack/react-query"

import { productsQueryOptions } from "@/features/products/api/product.queries"
import type { InitialProducts } from "@/features/products/api/product.queries"
import { useServerData } from "@/features/products/hooks/use-server-data"
import type { ProductsFilters } from "@/features/products/schemas/product-list-params.schema"

/**
 * The server's page fills the cache only for the filters and the page it was fetched with. Every
 * other page, filter or sort is fetched here, on the client.
 */
export function useProducts(filters: ProductsFilters, initial?: InitialProducts | null) {
  const options = productsQueryOptions(filters)
  const isInitial = initial ? hashKey(initial.queryKey) === hashKey(options.queryKey) : false
  useServerData(options.queryKey, isInitial ? initial?.data : null, initial?.updatedAt)

  return useQuery(options)
}
