import { stripSearchParams } from "@tanstack/react-router"
import { z } from "zod"

/**
 * The router parses `?q=123` into a number and `?q=true` into a boolean, so those become text
 * again here. Anything invalid in a shared link falls back to the first page or an empty search.
 */
export const usersSearchSchema = z.object({
  page: z.coerce.number().int().positive().default(1).catch(1),
  q: z.union([z.string(), z.number(), z.boolean()]).transform(String).default("").catch("")
})

export type UsersFilters = z.infer<typeof usersSearchSchema>

/** Spread into the page's route. Default values stay out of the URL. */
export const usersRouteSearch = {
  validateSearch: usersSearchSchema,
  search: { middlewares: [stripSearchParams<UsersFilters>({ page: 1, q: "" })] }
}
