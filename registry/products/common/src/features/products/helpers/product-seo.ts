import { PRODUCT_CURRENCY } from "@/features/products/constants/products.constants"
import type {
  ProductCategory,
  ProductDetails,
  ProductsPage
} from "@/features/products/schemas/product.schema"

/** The image that stands for a product in a share preview: its first photo, or its thumbnail. */
export function getProductImage(product: Pick<ProductDetails, "images" | "thumbnail">) {
  return product.images[0] ?? product.thumbnail
}

const AVAILABILITY: Record<string, string> = {
  "In Stock": "https://schema.org/InStock",
  "Low Stock": "https://schema.org/LimitedAvailability",
  "Out of Stock": "https://schema.org/OutOfStock"
}

/**
 * The product as schema.org `Product` data, for search results. `url` is the page's absolute
 * address. The rating goes in only with reviews to back it.
 */
export function getProductJsonLd(product: ProductDetails, url: string) {
  const availability = AVAILABILITY[product.availabilityStatus]

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.length > 0 ? product.images : [product.thumbnail],
    sku: product.sku,
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    ...(product.category && { category: product.category }),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: PRODUCT_CURRENCY,
      ...(availability && { availability }),
      url
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews.length
      }
    })
  }
}

/** JSON for a `<script type="application/ld+json">`: a `<` in the data cannot close the tag. */
export function toJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}

/** What the list page's title and description say: from the URL, and the server's data if any. */
export type ProductListFacts = {
  query: string
  /** The chosen category's name, or its slug while the names are not known. */
  category: string
  page: number
  /** `null` when the request failed. */
  total: number | null
  /** The first product's thumbnail, for the share preview. */
  image: string | null
}

export function getProductListFacts(
  { q, category, page }: { q: string; category: string; page: number },
  data: ProductsPage | null | undefined,
  categories: ProductCategory[] | null | undefined
): ProductListFacts {
  const query = q.trim()
  // A search covers every category, so its page is about the search alone.
  const slug = query ? "" : category
  const name = categories?.find((item) => item.slug === slug)?.name ?? slug

  return {
    query,
    category: name,
    page,
    total: data ? data.total : null,
    image: data?.products[0]?.thumbnail ?? null
  }
}

/** The words the list's title and description are made of, so the i18n layers can pass theirs. */
export type ProductListTexts = {
  title: string
  searchTitle: (query: string) => string
  pageTitle: (title: string, page: number) => string
  description: string
  listDescription: (count: number) => string
  categoryDescription: (count: number, category: string) => string
  searchDescription: (count: number, query: string) => string
}

/** "1 product", "2 products". */
function countOf(count: number, noun: string) {
  return `${count} ${count === 1 ? noun : `${noun}s`}`
}

const ENGLISH: ProductListTexts = {
  title: "Products",
  searchTitle: (query) => `Results for “${query}”`,
  pageTitle: (title, page) => `${title} · Page ${page}`,
  description: "Browse the products, search them and sort them by price, rating or discount.",
  listDescription: (count) =>
    `Browse ${countOf(count, "product")}, search them and sort them by price, rating or discount.`,
  categoryDescription: (count, category) =>
    `Browse ${countOf(count, "product")} in ${category} and sort them by price, rating or discount.`,
  searchDescription: (count, query) => `${countOf(count, "result")} for “${query}”.`
}

/**
 * The list page's title and description: the category or the search, and the page from page 2
 * on. Without the server's data, the description is the general one.
 */
export function getProductListText(facts: ProductListFacts, texts: ProductListTexts = ENGLISH) {
  const base = facts.query
    ? texts.searchTitle(facts.query)
    : facts.category
      ? facts.category
      : texts.title
  const title = facts.page > 1 ? texts.pageTitle(base, facts.page) : base
  const description =
    facts.total === null
      ? texts.description
      : facts.query
        ? texts.searchDescription(facts.total, facts.query)
        : facts.category
          ? texts.categoryDescription(facts.total, facts.category)
          : texts.listDescription(facts.total)

  return { title, description }
}
