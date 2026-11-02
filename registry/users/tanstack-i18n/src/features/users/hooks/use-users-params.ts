"use client"

import { useCallback, useEffect, useState } from "react"

import { useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"

import { SEARCH_DEBOUNCE_MS } from "@/features/users/constants/users.constants"
import { usersSearchSchema } from "@/features/users/schemas/users-params.schema"

/**
 * Page and search live in the URL. `q` follows every keystroke for the input, while
 * `debouncedQ` and the URL wait for a pause, so typing does not send a request per letter.
 * The hook reads the current route, so the module works on whichever page renders it.
 */
export function useUsersParams() {
  const { page, q: debouncedQ } = usersSearchSchema.parse(useSearch({ strict: false }))
  const navigate = useNavigate()
  // What was typed but is not in the URL yet. Without it, the input follows the URL, as on Back.
  const [draft, setDraft] = useState<string | null>(null)

  // useDebounceCallback starts a new timer when its function changes, so this one must be stable.
  const commit = useCallback(
    async (value: string) => {
      // A new search has its own pages, so it always starts from the first one.
      await navigate({ to: ".", search: { q: value, page: 1 }, replace: true, resetScroll: false })
      setDraft((current) => (current === value ? null : current))
    },
    [navigate]
  )
  const commitSearch = useDebounceCallback(commit, SEARCH_DEBOUNCE_MS)

  // Leaving the page must not run a pending search, which would navigate back to it.
  useEffect(() => commitSearch.cancel, [commitSearch])

  return {
    page,
    q: draft ?? debouncedQ,
    debouncedQ,
    setPage: (nextPage: number) =>
      navigate({ to: ".", search: (prev) => ({ ...prev, page: nextPage }), resetScroll: false }),
    setSearch: (value: string) => {
      setDraft(value)
      commitSearch(value)
    },
    clearSearch: () => {
      commitSearch.cancel()
      setDraft(null)
      navigate({ to: ".", search: { q: "", page: 1 }, replace: true, resetScroll: false })
    }
  }
}
