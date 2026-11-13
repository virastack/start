import { api } from "@/lib/api"

import { PRODUCTS_PATH } from "@/features/products/constants/products.constants"
import { productDetailsSchema } from "@/features/products/schemas/product.schema"
import type { ProductDetails } from "@/features/products/schemas/product.schema"

export function getProduct(id: number, signal?: AbortSignal): Promise<ProductDetails> {
  return api.get(`${PRODUCTS_PATH}/${id}`, { schema: productDetailsSchema, signal })
}
