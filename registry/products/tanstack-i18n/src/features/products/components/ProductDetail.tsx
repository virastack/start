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
import { DISCOUNT_BADGE_CLASS_NAME } from "@/features/products/constants/products.constants"
import { isNotFoundError } from "@/features/products/helpers/get-error-message"
import { getDiscountPercent } from "@/features/products/helpers/price"
import { useErrorMessage } from "@/features/products/hooks/use-error-message"
import { useProduct } from "@/features/products/hooks/use-product"
import { useProductId } from "@/features/products/hooks/use-product-id"
import * as m from "@/paraglide/messages"

type ProductDetailProps = {
  /**
   * The product the server fetched for the page, so its HTML already has it. Without it, the
   * product loads on the client.
   */
  initialProduct?: InitialProduct
}

/** A product's page: images, price, stock, details and reviews. It reads the id from the path. */
export function ProductDetail({ initialProduct }: ProductDetailProps) {
  const getErrorMessage = useErrorMessage()
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
          <EmptyTitle>{m.products_detail_load_error_title()}</EmptyTitle>
          <EmptyDescription>{getErrorMessage(product.error)}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" disabled={product.isFetching} onClick={() => product.refetch()}>
            {product.isFetching ? m.products_retrying() : m.products_retry()}
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const details = product.data
  // Until the full product arrives, only what the list card had is real.
  const isPreview = product.isPlaceholderData
  const percent = getDiscountPercent(details.discountPercentage)
  const discount = percent === null ? null : m.products_discount({ percent })
  const isOutOfStock = details.availabilityStatus === "Out of Stock"
  const stock =
    details.availabilityStatus === "Low Stock"
      ? m.products_stock_low()
      : isOutOfStock
        ? m.products_stock_out()
        : null

  // There is no cart yet: the toast stands where a cart module's call goes.
  const addToCart = () => toast.success(m.products_added_to_cart(), { description: details.title })

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
                {m.products_review_count({ count: details.reviews.length })}
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
            {isOutOfStock ? m.products_stock_out() : m.products_add_to_cart()}
          </Button>
          {isPreview ? (
            <ProductTextSkeleton />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {m.products_in_stock({ count: details.stock })}
              </p>
              <p className="leading-relaxed">{details.description}</p>
              {details.tags.length > 0 && (
                <ul aria-label={m.products_tags()} className="flex flex-wrap gap-1.5">
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
