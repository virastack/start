import { cache } from "react"
import type { Metadata } from "next"

import { getTranslations, setRequestLocale } from "next-intl/server"
import type { SearchParams } from "nuqs/server"

import { getLocalizedMetadata, getPageAlternates } from "@/config/seo.config"

import { getInitialProducts } from "@/features/products/api/get-initial-products.api"
import { ProductList } from "@/features/products/components/ProductList"
import { ProductListTitle } from "@/features/products/components/ProductListTitle"
import { getProductsCanonicalHref } from "@/features/products/helpers/product-href"
import { getProductListTexts } from "@/features/products/helpers/product-list-texts"
import { getProductListFacts, getProductListText } from "@/features/products/helpers/product-seo"
import { loadProductListParams } from "@/features/products/schemas/product-list-params.schema"
import { getPathname } from "@/i18n/routing"

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}

// The metadata and the page both need the list, so they share one request per render.
const loadList = cache((search: string) => getInitialProducts(Promise.resolve(JSON.parse(search))))

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale }, search] = await Promise.all([params, searchParams])
  const [t, filters, initial] = await Promise.all([
    getTranslations({ locale, namespace: "Products" }),
    loadProductListParams(Promise.resolve(search)),
    loadList(JSON.stringify(search))
  ])
  const facts = getProductListFacts(filters, initial.data, initial.categories)
  const { title, description } = getProductListText(facts, getProductListTexts(t))
  const href = getProductsCanonicalHref(filters)
  const url = getPathname({ locale, href })
  // The site's localized defaults, since a page replaces the whole `openGraph` and `twitter`.
  const site = getLocalizedMetadata(locale, description)
  const images = facts.image ? [{ url: facts.image, alt: title }] : undefined

  return {
    title,
    description,
    alternates: getPageAlternates(locale, href),
    openGraph: { ...site.openGraph, title, url, ...(images && { images }) },
    twitter: { ...site.twitter, title, ...(images && { images }) },
    // Search results are not pages of their own; their links are still followed.
    ...(facts.query && { robots: { index: false, follow: true } })
  }
}

/**
 * The server fetches the page the URL asks for, so the first HTML already lists the products.
 * Other pages, filters and sorting load on the client.
 */
export default async function Page({ params, searchParams }: PageProps) {
  const [{ locale }, search] = await Promise.all([params, searchParams])
  setRequestLocale(locale)
  const [t, initialProducts] = await Promise.all([
    getTranslations("Products"),
    loadList(JSON.stringify(search))
  ])

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      {/*
        No Suspense boundary: the page reads `searchParams`, so it renders per request and nuqs has
        the URL on the server. A boundary here would let the list stream in later, hidden until
        JavaScript shows it.
      */}
      <ProductList initialProducts={initialProducts} />
      <ProductListTitle initialProducts={initialProducts} />
    </main>
  )
}
