import { ProductCard } from "@/features/products/components/ProductCard"
import type { Product } from "@/features/products/schemas/product.schema"

type ProductGridProps = {
  products: Product[]
  /** Where the page starts in the whole list, for the position screen readers announce. */
  offset: number
  total: number
}

/** The first row is above the fold, so its images load at once instead of lazily. */
const EAGER_IMAGES = 4

/** Columns follow the grid's own width, not the screen's, so the module fits any page. */
export function ProductGrid({ products, offset, total }: ProductGridProps) {
  return (
    <ul
      aria-label="Products"
      className="grid grid-cols-2 gap-3 @xl:grid-cols-3 @xl:gap-4 @3xl:grid-cols-4"
    >
      {products.map((product, index) => (
        <li key={product.id} aria-posinset={offset + index + 1} aria-setsize={total}>
          <ProductCard product={product} eager={index < EAGER_IMAGES} />
        </li>
      ))}
    </ul>
  )
}
