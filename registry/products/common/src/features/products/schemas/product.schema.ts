import { z } from "zod"

/**
 * A product's id as a path segment holds it: a positive whole number written the plain way, so
 * `01`, `1.0`, `1e2` and `0x10` are not product pages.
 */
export const productIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .pipe(z.number().int().safe())

export const productSortSchema = z.enum([
  "featured",
  "price-asc",
  "price-desc",
  "rating",
  "discount",
  "title"
])

// Only what a card shows: `select` asks DummyJSON for these fields alone.
const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  // Groceries come without a brand.
  brand: z.string().optional(),
  price: z.number(),
  discountPercentage: z.number().default(0),
  rating: z.number(),
  availabilityStatus: z.string(),
  thumbnail: z.url()
})

const reviewSchema = z.object({
  rating: z.number(),
  comment: z.string(),
  date: z.iso.datetime(),
  reviewerName: z.string()
})

// Everything the detail page shows. Unknown keys are dropped, reviewer emails among them.
export const productDetailsSchema = productSchema.extend({
  description: z.string(),
  category: z.string().optional(),
  images: z.url().array(),
  tags: z.string().array(),
  sku: z.string(),
  stock: z.number(),
  dimensions: z.object({ width: z.number(), height: z.number(), depth: z.number() }),
  warrantyInformation: z.string(),
  shippingInformation: z.string(),
  returnPolicy: z.string(),
  minimumOrderQuantity: z.number(),
  reviews: reviewSchema.array()
})

export const productsPageSchema = z.object({
  products: productSchema.array(),
  total: z.number(),
  skip: z.number(),
  limit: z.number()
})

export const productCategorySchema = z.object({
  slug: z.string(),
  name: z.string()
})

export type Product = z.infer<typeof productSchema>
export type ProductDetails = z.infer<typeof productDetailsSchema>
export type ProductReview = z.infer<typeof reviewSchema>
export type ProductsPage = z.infer<typeof productsPageSchema>
export type ProductCategory = z.infer<typeof productCategorySchema>
export type ProductSort = z.infer<typeof productSortSchema>
