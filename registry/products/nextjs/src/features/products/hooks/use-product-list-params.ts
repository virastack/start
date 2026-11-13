"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { useQueryStates } from "nuqs"
import { useDebounceCallback } from "usehooks-ts"

import { SEARCH_DEBOUNCE_MS } from "@/features/products/constants/products.constants"
import {
  productListSearchParams,
  serializeProductListParams
} from "@/features/products/schemas/product-list-params.schema"
import type { ProductSort } from "@/features/products/schemas/product.schema"

/**
 * The filters and the page live in the URL, changed on the client without a server round trip.
 * `q` follows every keystroke for the input, while `query` and the URL wait for a pause, so typing
 * does not send a request per letter; the page goes back to 1 together with that search, not
 * before it. An emptied search, like Back and Forward, applies at once.
 */
export function useProductListParams() {
  // The page's own path, so a link to page 1 without filters still names a page.
  const pathname = usePathname() ?? ""
  const [{ q, category, sort, page }, setParams] = useQueryStates(productListSearchParams)
  // What was typed but is not in the URL yet. Without it, the input follows the URL.
  const [draft, setDraft] = useState<string | null>(null)

  // useDebounceCallback starts a new timer when its function changes, so this one must be stable.
  const commit = useCallback(
    async (value: string) => {
      await setParams({ q: value, page: 1 })
      setDraft((current) => (current === value ? null : current))
    },
    [setParams]
  )
  const commitSearch = useDebounceCallback(commit, SEARCH_DEBOUNCE_MS)

  // Leaving the page must not run a pending search.
  useEffect(() => commitSearch.cancel, [commitSearch])

  const push = (
    values: Partial<{ q: string; category: string; sort: ProductSort; page: number }>
  ) => {
    commitSearch.cancel()
    setDraft(null)
    return setParams(values, { history: "push" })
  }

  return {
    q: draft ?? q,
    query: q,
    category,
    sort,
    page,
    getPageHref: (target: number) =>
      serializeProductListParams(pathname, { q, category, sort, page: target }),
    setPage: (target: number) => setParams({ page: target }, { history: "push" }),
    setSearch: (value: string) => {
      if (value.trim()) {
        setDraft(value)
        commitSearch(value)
        return
      }
      commitSearch.cancel()
      setDraft(null)
      void setParams({ q: "", page: 1 })
    },
    // A search covers every category, so picking one ends the search.
    setCategory: (value: string) => push({ category: value, q: "", page: 1 }),
    setSort: (value: ProductSort) => push({ sort: value, page: 1 }),
    clearFilters: () => push({ q: "", category: "", page: 1 })
  }
}
