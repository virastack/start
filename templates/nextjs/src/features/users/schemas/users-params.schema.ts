import { createLoader, createParser, parseAsString } from "nuqs/server"
import type { inferParserType } from "nuqs/server"
import { z } from "zod"

const pageSchema = z.coerce.number().int().positive()

const parseAsPage = createParser({
  parse: (value) => {
    const result = pageSchema.safeParse(value)
    return result.success ? result.data : null
  },
  serialize: String
})

/** Shared by the server loader and the client hook, so both read the same view from the URL. */
export const usersSearchParams = {
  page: parseAsPage.withDefault(1),
  q: parseAsString.withDefault("")
}

export const loadUsersParams = createLoader(usersSearchParams)

export type UsersFilters = inferParserType<typeof usersSearchParams>
