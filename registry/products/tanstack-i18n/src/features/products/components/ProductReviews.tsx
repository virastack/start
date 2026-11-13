import { ProductRating } from "@/features/products/components/ProductRating"
import { useProductFormat } from "@/features/products/hooks/use-product-format"
import type { ProductReview } from "@/features/products/schemas/product.schema"
import * as m from "@/paraglide/messages"

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  const format = useProductFormat()

  return (
    <section aria-labelledby="product-reviews" className="flex flex-col gap-3">
      <h2 id="product-reviews" className="text-lg font-semibold">
        {m.products_reviews_title()}
      </h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">{m.products_no_reviews()}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {/* Reviews have no id, and one person can leave two on the same day. */}
          {reviews.map((review, index) => (
            <li key={index} className="flex flex-col gap-1 border-b pb-4 text-sm">
              <ProductRating rating={review.rating} />
              <p>{review.comment}</p>
              <p className="text-xs text-muted-foreground">
                {review.reviewerName} ·{" "}
                <time dateTime={review.date}>{format.date(review.date)}</time>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
