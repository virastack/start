import { getProduct } from "@/features/products/api/get-product.api"
import type { InitialProduct } from "@/features/products/api/product.queries"
import { isNotFoundError } from "@/features/products/helpers/get-error-message"
import { productIdSchema } from "@/features/products/schemas/product.schema"

/**
 * Fetches on the server the product `ProductDetail` shows first, from the page's `params`. A wrong
 * id or a 404 sets `notFound`, so the page can call Next.js `notFound()`. Any other failure leaves
 * the product to the client, which then shows its error state and retries.
 */
export async function getInitialProduct(params: Promise<{ id: string }>): Promise<InitialProduct> {
  const updatedAt = Date.now()
  const result = productIdSchema.safeParse((await params).id)
  if (!result.success) return { product: null, notFound: true, updatedAt }

  try {
    return { product: await getProduct(result.data), notFound: false, updatedAt }
  } catch (error) {
    return { product: null, notFound: isNotFoundError(error), updatedAt }
  }
}
