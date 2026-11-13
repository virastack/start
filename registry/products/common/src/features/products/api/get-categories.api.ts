import { api } from "@/lib/api"

import { PRODUCTS_PATH } from "@/features/products/constants/products.constants"
import { productCategorySchema } from "@/features/products/schemas/product.schema"
import type { ProductCategory } from "@/features/products/schemas/product.schema"

export function getCategories(signal?: AbortSignal): Promise<ProductCategory[]> {
  return api.get(`${PRODUCTS_PATH}/categories`, { schema: productCategorySchema.array(), signal })
}
