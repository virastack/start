import {
  createLoader,
  createParser,
  createSerializer,
  parseAsString,
  parseAsStringLiteral
} from "nuqs/server"
import type { inferParserType } from "nuqs/server"
import { z } from "zod"

import { MAX_PAGE } from "@/features/products/constants/products.constants"
import { productSortSchema } from "@/features/products/schemas/product.schema"

// A whole number counts however it is written (`10`, `010`, `1e1`); anything else is the first
// page. A number past the safe range still counts, and the cap brings it back.
const pageSchema = z
  .string()
  .transform(Number)
  .pipe(z.number().positive().refine(Number.isInteger))
  .transform((value) => Math.min(value, MAX_PAGE))

// The slug becomes part of the request path. It is encoded there, which leaves only `.` and `..`
// able to change the path, so those are the ones turned away.
const categorySchema = z
  .string()
  .min(1)
  .refine((value) => value !== "." && value !== "..")

const parseAsPage = createParser({
  parse: (value) => {
    const result = pageSchema.safeParse(value)
    return result.success ? result.data : null
  },
  serialize: String
})

const parseAsCategory = createParser({
  parse: (value) => {
    const result = categorySchema.safeParse(value)
    return result.success ? result.data : null
  },
  serialize: String
})

/** Shared by the server loader and the client hook, so both read the same view from the URL. */
export const productListSearchParams = {
  q: parseAsString.withDefault(""),
  category: parseAsCategory.withDefault(""),
  sort: parseAsStringLiteral(productSortSchema.options).withDefault("featured"),
  page: parseAsPage.withDefault(1)
}

export const loadProductListParams = createLoader(productListSearchParams)
export const serializeProductListParams = createSerializer(productListSearchParams)

/** What the list shows: the filters and the page. */
export type ProductsFilters = inferParserType<typeof productListSearchParams>
