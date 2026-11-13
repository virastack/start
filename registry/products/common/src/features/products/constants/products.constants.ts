import type { ProductSort } from "@/features/products/schemas/product.schema"

/** The API's path. */
export const PRODUCTS_PATH = "/products"
/**
 * Where the list page lives in this app; a product's page is `/products/<id>` under it. Change it
 * if you move the pages.
 */
export const PRODUCTS_ROUTE = "/products"
/** Divisible by 2, 3 and 4, so every full page fills whole rows. */
export const PRODUCTS_PAGE_SIZE = 24
export const SEARCH_DEBOUNCE_MS = 300
/** DummyJSON's prices are in US dollars. */
export const PRODUCT_CURRENCY = "USD"
/**
 * A page past any real list. A bigger one from a link counts as this one, so the request keeps a
 * plain number and the list says the page is empty instead of failing.
 */
export const MAX_PAGE = 100_000
/**
 * How long a list or a product counts as fresh. The module sets it itself, so what the server
 * rendered is not fetched again on load, whatever the app's own QueryClient default is.
 */
export const PRODUCTS_STALE_TIME = 60 * 1000
export const PRODUCT_FIELDS =
  "title,brand,price,discountPercentage,rating,availabilityStatus,thumbnail"

/** The select's value for "every category"; the URL leaves `category` out instead. */
export const ALL_CATEGORIES = "all"

export const PRODUCT_SORTS: Record<
  ProductSort,
  { label: string; sortBy?: string; order?: "asc" | "desc" }
> = {
  // The API's own order.
  featured: { label: "Featured" },
  "price-asc": { label: "Price: low to high", sortBy: "price", order: "asc" },
  "price-desc": { label: "Price: high to low", sortBy: "price", order: "desc" },
  rating: { label: "Top rated", sortBy: "rating", order: "desc" },
  discount: { label: "Biggest discount", sortBy: "discountPercentage", order: "desc" },
  title: { label: "Name: A to Z", sortBy: "title", order: "asc" }
}

/** The API's stock words, as the badges say them. "In Stock" gets no badge. */
export const STOCK_LABELS: Record<string, string> = {
  "Low Stock": "Low stock",
  "Out of Stock": "Out of stock"
}

/**
 * The discount badge, solid so its text keeps 4.5:1 contrast in both themes; the destructive
 * variant's tinted look is under that at this size.
 */
export const DISCOUNT_BADGE_CLASS_NAME = "bg-red-700 text-white dark:bg-red-700"
