"use client"

import { useCallback, useEffect, useState } from "react"

import { useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { useDebounceCallback } from "usehooks-ts"

import { SEARCH_DEBOUNCE_MS } from "@/features/products/constants/products.constants"
import {
  productListSearchSchema,
  toListSearch
} from "@/features/products/schemas/product-list-params.schema"
import type { ProductSort } from "@/features/products/schemas/product.schema"

/**
 * The filters and the page live in the URL, changed on the client without a document load. `q`
 * follows every keystroke for the input, while `query` and the URL wait for a pause, so typing does
 * not send a request per letter; the page goes back to 1 together with that search, not before it.
 * An emptied search, like Back and Forward, applies at once. The hook reads the current route, so
 * the module works on whichever page renders it.
 */
export function useProductListParams() {
  const filters = productListSearchSchema.parse(useSearch({ strict: false }))
  const { pathname } = useLocation()
  const navigate = useNavigate()
  // What was typed but is not in the URL yet. Without it, the input follows the URL, as on Back.
  const [draft, setDraft] = useState<string | null>(null)

  // useDebounceCallback starts a new timer when its function changes, so this one must be stable.
  const commit = useCallback(
    async (value: string) => {
      await navigate({
        to: ".",
        search: (prev) => ({ ...prev, q: value, page: 1 }),
        replace: true,
        resetScroll: false
      })
      setDraft((current) => (current === value ? null : current))
    },
    [navigate]
  )
  const commitSearch = useDebounceCallback(commit, SEARCH_DEBOUNCE_MS)

  // Leaving the page must not run a pending search, which would navigate back to it.
  useEffect(() => commitSearch.cancel, [commitSearch])

  const navigateTo = (search: Partial<typeof filters>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...search }), resetScroll: false })
  // A filter replaces a search still being typed.
  const push = (search: Partial<typeof filters>) => {
    commitSearch.cancel()
    setDraft(null)
    return navigateTo(search)
  }

  return {
    q: draft ?? filters.q,
    query: filters.q,
    category: filters.category,
    sort: filters.sort,
    page: filters.page,
    getPageHref: (target: number) => `${pathname}${toListSearch({ ...filters, page: target })}`,
    setPage: (target: number) => navigateTo({ page: target }),
    setSearch: (value: string) => {
      if (value.trim()) {
        setDraft(value)
        commitSearch(value)
        return
      }
      commitSearch.cancel()
      setDraft(null)
      void navigate({
        to: ".",
        search: (prev) => ({ ...prev, q: "", page: 1 }),
        replace: true,
        resetScroll: false
      })
    },
    // A search covers every category, so picking one ends the search.
    setCategory: (value: string) => push({ category: value, q: "", page: 1 }),
    setSort: (value: ProductSort) => push({ sort: value, page: 1 }),
    clearFilters: () => push({ q: "", category: "", page: 1 })
  }
}
