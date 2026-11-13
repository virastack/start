import { ProductRating } from "@/features/products/components/ProductRating"
import type { ProductReview } from "@/features/products/schemas/product.schema"

// In UTC, so the server and the browser write the same day.
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" })

export function ProductReviews({ reviews }: { reviews: ProductReview[] }) {
  return (
    <section aria-labelledby="product-reviews" className="flex flex-col gap-3">
      <h2 id="product-reviews" className="text-lg font-semibold">
        Reviews
      </h2>
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {/* Reviews have no id, and one person can leave two on the same day. */}
          {reviews.map((review, index) => (
            <li key={index} className="flex flex-col gap-1 border-b pb-4 text-sm">
              <ProductRating rating={review.rating} />
              <p>{review.comment}</p>
              <p className="text-xs text-muted-foreground">
                {review.reviewerName} ·{" "}
                <time dateTime={review.date}>{dateFormat.format(new Date(review.date))}</time>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
