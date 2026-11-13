"use client"

import { ShoppingCartIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import type { InitialProduct } from "@/features/products/api/product.queries"
import { ProductBackLink } from "@/features/products/components/ProductBackLink"
import {
  ProductDetailSkeleton,
  ProductTextSkeleton
} from "@/features/products/components/ProductDetailSkeleton"
import { ProductFavoriteButton } from "@/features/products/components/ProductFavoriteButton"
import { ProductGallery } from "@/features/products/components/ProductGallery"
import { ProductNotFound } from "@/features/products/components/ProductNotFound"
import { ProductPrice } from "@/features/products/components/ProductPrice"
import { ProductRating } from "@/features/products/components/ProductRating"
import { ProductReviews } from "@/features/products/components/ProductReviews"
import { ProductSpecs } from "@/features/products/components/ProductSpecs"
import {
  DISCOUNT_BADGE_CLASS_NAME,
  STOCK_LABELS
} from "@/features/products/constants/products.constants"
import { getErrorMessage, isNotFoundError } from "@/features/products/helpers/get-error-message"
import { getDiscountLabel } from "@/features/products/helpers/price"
import { useProduct } from "@/features/products/hooks/use-product"
import { useProductId } from "@/features/products/hooks/use-product-id"

type ProductDetailProps = {
  /**
   * The product the server fetched for the page, so its HTML already has it. Without it, the
   * product loads on the client.
   */
  initialProduct?: InitialProduct
}

/** A product's page: images, price, stock, details and reviews. It reads the id from the path. */
export function ProductDetail({ initialProduct }: ProductDetailProps) {
  const pathId = useProductId()
  // The server already knows there is no such product, so the client does not ask again.
  const id = initialProduct?.notFound ? null : pathId
  const product = useProduct(id, initialProduct)

  if (id === null || (product.isError && isNotFoundError(product.error))) return <ProductNotFound />

  if (product.isPending) return <ProductDetailSkeleton />

  if (product.isError) {
    return (
      <Empty role="alert" className="border">
        <EmptyHeader>
          <EmptyTitle>Could not load the product</EmptyTitle>
          <EmptyDescription>{getErrorMessage(product.error)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" disabled={product.isFetching} onClick={() => product.refetch()}>
            {product.isFetching ? "Retrying…" : "Retry"}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const details = product.data
  // Until the full product arrives, only what the list card had is real.
  const isPreview = product.isPlaceholderData
  const discount = getDiscountLabel(details.discountPercentage)
  const stock = STOCK_LABELS[details.availabilityStatus]
  const isOutOfStock = details.availabilityStatus === "Out of Stock"

  // There is no cart yet: the toast stands where a cart module's call goes.
  const addToCart = () => toast.success("Added to cart", { description: details.title })

  return (
    <article aria-busy={isPreview} className="@container flex flex-col gap-6">
      <div>
        <ProductBackLink />
      </div>
      <div className="grid gap-6 @3xl:grid-cols-2 @3xl:gap-10">
        <ProductGallery
          key={details.id}
          images={details.images}
          title={details.title}
          action={<ProductFavoriteButton title={details.title} />}
        />
        <div className="flex flex-col gap-3">
          {details.brand && <p className="text-sm text-muted-foreground">{details.brand}</p>}
          <h1 className="text-2xl font-semibold text-balance">{details.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ProductRating rating={details.rating} />
            {!isPreview && (
              <span className="text-xs text-muted-foreground">
                {details.reviews.length === 1 ? "1 review" : `${details.reviews.length} reviews`}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProductPrice price={details.price} discountPercentage={details.discountPercentage} />
            {discount && (
              <Badge variant="destructive" className={DISCOUNT_BADGE_CLASS_NAME}>
                {discount}
              </Badge>
            )}
            {stock && <Badge variant="secondary">{stock}</Badge>}
          </div>
          <Button
            size="lg"
            className="w-full @xl:w-fit"
            disabled={isPreview || isOutOfStock}
            onClick={addToCart}
          >
            <ShoppingCartIcon aria-hidden />
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </Button>
          {isPreview ? (
            <ProductTextSkeleton />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{`${details.stock} in stock`}</p>
              <p className="leading-relaxed">{details.description}</p>
              {details.tags.length > 0 && (
                <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
                  {details.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="outline">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
      {!isPreview && (
        <>
          <ProductSpecs product={details} />
          <ProductReviews reviews={details.reviews} />
        </>
      )}
    </article>
  )
}
