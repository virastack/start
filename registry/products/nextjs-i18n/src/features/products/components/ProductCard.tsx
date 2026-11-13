import { useTranslations } from "next-intl"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ProductImage } from "@/features/products/components/ProductImage"
import { ProductLink } from "@/features/products/components/ProductLink"
import { ProductPrice } from "@/features/products/components/ProductPrice"
import { ProductRating } from "@/features/products/components/ProductRating"
import { DISCOUNT_BADGE_CLASS_NAME } from "@/features/products/constants/products.constants"
import { getDiscountPercent } from "@/features/products/helpers/price"
import type { Product } from "@/features/products/schemas/product.schema"

type ProductCardProps = {
  product: Product
  /** Loads the image at once, for cards in the first row. */
  eager?: boolean
}

export function ProductCard({ product, eager = false }: ProductCardProps) {
  const t = useTranslations("Products")
  const percent = getDiscountPercent(product.discountPercentage)
  const discount = percent === null ? null : t("discount", { percent })
  // The API's stock words; "In Stock" gets no badge.
  const stock =
    product.availabilityStatus === "Low Stock"
      ? t("stock_low")
      : product.availabilityStatus === "Out of Stock"
        ? t("stock_out")
        : null

  return (
    // The title is the link and stretches over the card, so the whole card opens the product while
    // screen readers hear only its name.
    <Card className="relative h-full gap-0 py-0 transition-shadow hover:shadow-md has-[a:focus-visible]:ring-[3px] has-[a:focus-visible]:ring-ring/50">
      <div className="relative aspect-square bg-muted/50">
        <ProductImage src={product.thumbnail} eager={eager} />
        {(discount || stock) && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {discount && (
              <Badge variant="destructive" className={DISCOUNT_BADGE_CLASS_NAME}>
                {discount}
              </Badge>
            )}
            {stock && <Badge variant="secondary">{stock}</Badge>}
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        {product.brand && <p className="truncate text-xs text-muted-foreground">{product.brand}</p>}
        <h2 className="line-clamp-2 text-sm font-medium">
          <ProductLink
            productId={product.id}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {product.title}
          </ProductLink>
        </h2>
        <ProductRating rating={product.rating} />
        <div className="mt-auto pt-2">
          <ProductPrice price={product.price} discountPercentage={product.discountPercentage} />
        </div>
      </CardContent>
    </Card>
  )
}
