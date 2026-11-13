import type { ProductDetails } from "@/features/products/schemas/product.schema"

/** The API gives no units for the size, so the numbers stand as they are. */
function formatDimensions({ width, height, depth }: ProductDetails["dimensions"]) {
  return `${width} × ${height} × ${depth}`
}

export function ProductSpecs({ product }: { product: ProductDetails }) {
  const specs = [
    { label: "SKU", value: product.sku },
    { label: "Warranty", value: product.warrantyInformation },
    { label: "Shipping", value: product.shippingInformation },
    { label: "Returns", value: product.returnPolicy },
    { label: "Minimum order", value: `${product.minimumOrderQuantity} pieces` },
    { label: "Size (W × H × D)", value: formatDimensions(product.dimensions) }
  ]

  return (
    <section aria-labelledby="product-specs" className="flex flex-col gap-3">
      <h2 id="product-specs" className="text-lg font-semibold">
        Details
      </h2>
      <dl className="grid gap-x-6 gap-y-3 text-sm @xl:grid-cols-2">
        {specs.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 border-b pb-3">
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
