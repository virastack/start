"use client"

import { useEffect } from "react"

import { useTranslations } from "next-intl"

import { siteConfig } from "@/config/site.config"

import { toQueryFilters } from "@/features/products/api/product.queries"
import type { InitialProducts } from "@/features/products/api/product.queries"
import { getProductListTexts } from "@/features/products/helpers/product-list-texts"
import { getProductListFacts, getProductListText } from "@/features/products/helpers/product-seo"
import { useCategories } from "@/features/products/hooks/use-categories"
import { useProductListParams } from "@/features/products/hooks/use-product-list-params"
import { useProducts } from "@/features/products/hooks/use-products"

/**
 * Keeps the tab's title in step with the list. nuqs changes the URL without asking the server,
 * so `generateMetadata` does not run again; this writes the title a reload of the URL would give,
 * once the list shows it: while the next page loads, the old title stays. It reads the same cache
 * as the list, so it sends no request of its own, and renders nothing.
 */
export function ProductListTitle({
  initialProducts
}: {
  initialProducts?: InitialProducts | null
}) {
  const t = useTranslations("Products")
  const { query, category, sort, page } = useProductListParams()
  const products = useProducts(toQueryFilters({ q: query, category, sort, page }), initialProducts)
  const categories = useCategories(initialProducts?.categories, initialProducts?.updatedAt)
  const isShown = !products.isPlaceholderData && !products.isPending
  const facts = getProductListFacts({ q: query, category, page }, products.data, categories.data)
  // The layout's title template, which the server's title has too.
  const title = `${getProductListText(facts, getProductListTexts(t)).title} · ${siteConfig.name}`

  useEffect(() => {
    if (isShown) document.title = title
  }, [isShown, title])

  return null
}
