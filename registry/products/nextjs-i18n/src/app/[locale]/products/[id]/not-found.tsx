import { ProductNotFound } from "@/features/products/components/ProductNotFound"

/**
 * The page for a product that does not exist, under the 404 status the product page sets: the
 * module's own state, with the way back to the list, in place of the app's generic one.
 */
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
      <ProductNotFound />
    </main>
  )
}
