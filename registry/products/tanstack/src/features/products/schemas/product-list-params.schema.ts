import { stripSearchParams } from "@tanstack/react-router"
import { z } from "zod"

import { MAX_PAGE } from "@/features/products/constants/products.constants"
import { productSortSchema } from "@/features/products/schemas/product.schema"

// The router parses `?q=123` into a number and `?q=true` into a boolean, so those become text again.
const text = z.union([z.string(), z.number(), z.boolean()]).transform(String)

/**
 * Anything invalid in a shared link falls back to its default. The category slug becomes part of
 * the request path; it is encoded there, which leaves only `.` and `..` able to change the path.
 */
export const productListSearchSchema = z.object({
  q: text.default("").catch(""),
  category: text
    .refine((value) => value !== "." && value !== "..")
    .default("")
    .catch(""),
  sort: productSortSchema.default("featured").catch("featured"),
  // A whole number counts however it is written (`10`, `010`, `1e1`): the router has read most of
  // them as a number already, and the rest are text. Anything else is the first page. A number past
  // the safe range still counts, and the cap brings it back.
  page: z
    .union([z.number(), z.string().transform(Number)])
    .pipe(z.number().positive().refine(Number.isInteger))
    .transform((value) => Math.min(value, MAX_PAGE))
    .default(1)
    .catch(1)
})

/** What the list shows: the filters and the page. */
export type ProductsFilters = z.infer<typeof productListSearchSchema>

export const PRODUCT_LIST_DEFAULTS: ProductsFilters = {
  q: "",
  category: "",
  sort: "featured",
  page: 1
}

/** Spread into the list's route. Default values stay out of the URL. */
export const productListRouteSearch = {
  validateSearch: productListSearchSchema,
  search: { middlewares: [stripSearchParams<ProductsFilters>(PRODUCT_LIST_DEFAULTS)] }
}

/** `?category=beauty&page=2` for a link, without the defaults, as the router writes it. */
export function toListSearch(filters: ProductsFilters) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== PRODUCT_LIST_DEFAULTS[key as keyof ProductsFilters])
      params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `?${search}` : ""
}
