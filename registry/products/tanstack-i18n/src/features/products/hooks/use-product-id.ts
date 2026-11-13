"use client"

import { useParams } from "@tanstack/react-router"

import { productIdSchema } from "@/features/products/schemas/product.schema"

/**
 * The `$id` segment of the product page's path, or `null` when it is not a product id. It reads
 * the current route loosely, so the module also works on a page of your own with an `$id`.
 */
export function useProductId() {
  // Typed loosely on purpose: without the module's pages, no route of the app has an `$id`.
  const params: { id?: string } = useParams({ strict: false })
  const result = productIdSchema.safeParse(params.id)
  return result.success ? result.data : null
}
