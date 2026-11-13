"use client"

import { useParams } from "next/navigation"

import { productIdSchema } from "@/features/products/schemas/product.schema"

/** The `[id]` segment of the product page's path, or `null` when it is not a product id. */
export function useProductId() {
  const { id } = useParams<{ id: string }>()
  const result = productIdSchema.safeParse(id)
  return result.success ? result.data : null
}
