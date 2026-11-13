import { useProductFormat } from "@/features/products/hooks/use-product-format"
import type { ProductDetails } from "@/features/products/schemas/product.schema"
import * as m from "@/paraglide/messages"

/** The API gives no units for the size, so the numbers stand as they are, in the locale's format. */
function formatDimensions(
  { width, height, depth }: ProductDetails["dimensions"],
  format: (value: number) => string
) {
  return `${format(width)} × ${format(height)} × ${format(depth)}`
}

export function ProductSpecs({ product }: { product: ProductDetails }) {
  const format = useProductFormat()
  const specs = [
    { label: m.products_spec_sku(), value: product.sku },
    { label: m.products_spec_warranty(), value: product.warrantyInformation },
    { label: m.products_spec_shipping(), value: product.shippingInformation },
    { label: m.products_spec_returns(), value: product.returnPolicy },
    {
      label: m.products_spec_minimum_order(),
      value: m.products_minimum_order_value({ count: product.minimumOrderQuantity })
    },
    { label: m.products_spec_size(), value: formatDimensions(product.dimensions, format.number) }
  ]

  return (
    <section aria-labelledby="product-specs" className="flex flex-col gap-3">
      <h2 id="product-specs" className="text-lg font-semibold">
        {m.products_details_title()}
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
