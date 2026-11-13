"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"

import { productQueryOptions } from "@/features/products/api/product.queries"
import type { InitialProduct } from "@/features/products/api/product.queries"
import { productKeys } from "@/features/products/api/query-keys"
import { useServerData } from "@/features/products/hooks/use-server-data"
import type {
  Product,
  ProductDetails,
  ProductsPage
} from "@/features/products/schemas/product.schema"

/** The card's fields, with the rest empty until the product arrives. */
function toPreview(product: Product): ProductDetails {
  return {
    ...product,
    description: "",
    images: [product.thumbnail],
    tags: [],
    sku: "",
    stock: 0,
    dimensions: { width: 0, height: 0, depth: 0 },
    warrantyInformation: "",
    shippingInformation: "",
    returnPolicy: "",
    minimumOrderQuantity: 0,
    reviews: []
  }
}

function findInLists(queryClient: QueryClient, id: number) {
  const lists = queryClient.getQueriesData<ProductsPage>({ queryKey: productKeys.lists() })
  for (const [, data] of lists) {
    const product = data?.products.find((item) => item.id === id)
    if (product) return toPreview(product)
  }
  return undefined
}

/**
 * Coming from the list, the card already holds the title, image and price, so those show at once
 * while the rest loads. `initial` is what the server fetched for the page, when it did.
 */
export function useProduct(id: number | null, initial?: InitialProduct) {
  const queryClient = useQueryClient()
  const options = productQueryOptions(id ?? 0)
  const product = initial?.product
  useServerData(options.queryKey, product && product.id === id ? product : null, initial?.updatedAt)

  return useQuery({
    ...options,
    enabled: id !== null,
    placeholderData: () => (id === null ? undefined : findInLists(queryClient, id))
  })
}
