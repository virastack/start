"use client"

import { useRef, useState } from "react"

import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from "@/components/ui/empty"
import { toQueryFilters } from "@/features/products/api/product.queries"
import type { InitialProducts } from "@/features/products/api/product.queries"
import { ProductGrid } from "@/features/products/components/ProductGrid"
import { ProductGridSkeleton } from "@/features/products/components/ProductGridSkeleton"
import { ProductListToolbar } from "@/features/products/components/ProductListToolbar"
import { ProductPagination } from "@/features/products/components/ProductPagination"
import { PRODUCTS_PAGE_SIZE } from "@/features/products/constants/products.constants"
import { getErrorMessage } from "@/features/products/helpers/get-error-message"
import { useProductListParams } from "@/features/products/hooks/use-product-list-params"
import { useProducts } from "@/features/products/hooks/use-products"

type ProductListProps = {
  /**
   * The page the server fetched for the URL, so the HTML already has the products and nothing
   * loads on the first paint. Without it, the list starts on the client.
   */
  initialProducts?: InitialProducts | null
}

/** "1 product", "2 products". */
function countOf(count: number, noun: string) {
  return `${count} ${count === 1 ? noun : `${noun}s`}`
}

export function ProductList({ initialProducts }: ProductListProps) {
  const params = useProductListParams()
  const { q, page, sort, setSort, setPage, getPageHref, clearFilters } = params
  // A search covers every category, so the category waits until the search is cleared.
  const filters = toQueryFilters({ q: params.query, category: params.category, sort, page })
  const { q: search, category } = filters
  const products = useProducts(filters, initialProducts)
  const resultsRef = useRef<HTMLParagraphElement>(null)
  // While the next page loads, the one on screen stays: its range, positions and total, and the
  // search it answers, describe what is shown, not what the URL asks for now.
  const isLoadingNext = products.isPlaceholderData
  const [shownSearch, setShownSearch] = useState(search)
  if (!isLoadingNext && products.data && shownSearch !== search) setShownSearch(search)
  const items = products.data?.products ?? []
  const total = products.data?.total ?? 0
  const offset = products.data?.skip ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE))

  // A new page starts at the top of the list, so the reader goes there, and keyboard focus moves
  // to the summary above it instead of staying on the pagination below the old page.
  const goToPage = (next: number) => {
    setPage(next)
    const results = resultsRef.current
    if (!results) return
    if (results.getBoundingClientRect().top < 0) results.scrollIntoView({ block: "start" })
    results.focus({ preventScroll: true })
  }

  const range = `${offset + 1}–${offset + items.length}`
  const summary =
    !products.data || (isLoadingNext && items.length === 0)
      ? ""
      : items.length === 0
        ? "No products found"
        : shownSearch
          ? `${range} of ${countOf(total, "result")} for “${shownSearch}”`
          : `${range} of ${countOf(total, "product")}`

  return (
    <div className="@container flex flex-col gap-4">
      <ProductListToolbar
        q={q}
        category={category}
        sort={sort}
        initialCategories={initialProducts?.categories}
        categoriesUpdatedAt={initialProducts?.updatedAt}
        onSearch={params.setSearch}
        onCategoryChange={params.setCategory}
        onSortChange={setSort}
      />

      {/* Always in the page: a live region only announces changes it was already there for. */}
      <p
        ref={resultsRef}
        tabIndex={-1}
        aria-live="polite"
        className={cn(
          "scroll-mt-4 text-sm text-muted-foreground tabular-nums outline-none",
          (items.length === 0 || !products.data) && "sr-only"
        )}
      >
        {summary}
      </p>

      {products.isPending || (isLoadingNext && items.length === 0) ? (
        // An empty list on screen says nothing about the next one, so it does not stand in for it.
        <ProductGridSkeleton />
      ) : !products.data ? (
        <Empty role="alert" className="border">
          <EmptyHeader>
            <EmptyTitle>Could not load products</EmptyTitle>
            <EmptyDescription>{getErrorMessage(products.error)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant="outline"
              disabled={products.isFetching}
              onClick={() => products.refetch()}
            >
              {products.isFetching ? "Retrying…" : "Retry"}
            </Button>
          </EmptyContent>
        </Empty>
      ) : items.length === 0 ? (
        total > 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>This page is empty</EmptyTitle>
              <EmptyDescription>{`The results end before page ${page}.`}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => goToPage(1)}>
                Go to the first page
              </Button>
            </EmptyContent>
          </Empty>
        ) : search || category ? (
          <Empty className="border">
            <EmptyHeader>
              {/* The summary above already says it to screen readers. */}
              <EmptyTitle aria-hidden>No products found</EmptyTitle>
              <EmptyDescription>
                {search ? `Nothing matches “${search}”.` : "This category has no products."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => clearFilters()}>
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No products yet</EmptyTitle>
              <EmptyDescription>The API returned an empty list.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      ) : (
        <div
          aria-busy={isLoadingNext}
          className={cn("flex flex-col gap-4 transition-opacity", isLoadingNext && "opacity-60")}
        >
          <ProductGrid products={items} offset={offset} total={total} />
          {totalPages > 1 && (
            <ProductPagination
              page={page}
              totalPages={totalPages}
              getPageHref={getPageHref}
              onPageChange={goToPage}
            />
          )}
        </div>
      )}
    </div>
  )
}
