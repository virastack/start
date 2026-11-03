"use client"

import { debounce, useQueryStates } from "nuqs"
import { useDebounceValue } from "usehooks-ts"

import { SEARCH_DEBOUNCE_MS } from "@/features/users/constants/users.constants"
import { usersSearchParams } from "@/features/users/schemas/users-params.schema"

/**
 * Page and search live in the URL. `q` follows every keystroke for the input, while
 * `debouncedQ` and the URL wait for a pause, so typing does not send a request per letter.
 */
export function useUsersParams() {
  const [{ page, q }, setParams] = useQueryStates(usersSearchParams)
  const [debouncedQ] = useDebounceValue(q, SEARCH_DEBOUNCE_MS)

  return {
    page,
    q,
    debouncedQ,
    setPage: (nextPage: number) => setParams({ page: nextPage }, { history: "push" }),
    // A new search has its own pages, so it always starts from the first one.
    setSearch: (value: string) =>
      setParams({ q: value, page: 1 }, { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) }),
    clearSearch: () => setParams({ q: "", page: 1 })
  }
}
