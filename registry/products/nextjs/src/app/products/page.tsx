import { cache } from "react"
import type { Metadata } from "next"

import type { SearchParams } from "nuqs/server"

import { defaultMetadata } from "@/config/seo.config"

import { getInitialProducts } from "@/features/products/api/get-initial-products.api"
import { ProductList } from "@/features/products/components/ProductList"
import { ProductListTitle } from "@/features/products/components/ProductListTitle"
import { getProductsCanonicalHref } from "@/features/products/helpers/product-href"
import { getProductListFacts, getProductListText } from "@/features/products/helpers/product-seo"
import { loadProductListParams } from "@/features/products/schemas/product-list-params.schema"

type PageProps = {
  searchParams: Promise<SearchParams>
}

// The metadata and the page both need the list, so they share one request per render.
const loadList = cache((search: string) => getInitialProducts(Promise.resolve(JSON.parse(search))))

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const search = await searchParams
  const [params, initial] = await Promise.all([
    loadProductListParams(Promise.resolve(search)),
    loadList(JSON.stringify(search))
  ])
  const facts = getProductListFacts(params, initial.data, initial.categories)
  const { title, description } = getProductListText(facts)
  const url = getProductsCanonicalHref(params)
  const images = facts.image ? [{ url: facts.image, alt: title }] : undefined

  return {
    title,
    description,
    alternates: { canonical: url },
    // A page replaces the whole `openGraph` and `twitter` of the layout, so the site's stay in.
    openGraph: { ...defaultMetadata.openGraph, title, description, url, ...(images && { images }) },
    twitter: { ...defaultMetadata.twitter, title, description, ...(images && { images }) },
    // Search results are not pages of their own; their links are still followed.
    ...(facts.query && { robots: { index: false, follow: true } })
  }
}

/**
 * The server fetches the page the URL asks for, so the first HTML already lists the products.
 * Other pages, filters and sorting load on the client.
 */
export default async function Page({ searchParams }: PageProps) {
  const initialProducts = await loadList(JSON.stringify(await searchParams))

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
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
