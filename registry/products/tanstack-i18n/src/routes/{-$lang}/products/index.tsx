import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { hreflangLinks, localizedUrl } from "@/helpers/localized-url"

import { loadProductList } from "@/features/products/api/load-products"
import { ProductList } from "@/features/products/components/ProductList"
import { ProductListSkeleton } from "@/features/products/components/ProductListSkeleton"
import { getProductsCanonicalHref } from "@/features/products/helpers/product-href"
import { getProductListFacts, getProductListText } from "@/features/products/helpers/product-seo"
import { getShareMeta } from "@/features/products/helpers/share-meta"
import { productListRouteSearch } from "@/features/products/schemas/product-list-params.schema"
import * as m from "@/paraglide/messages"
import { getLocale } from "@/paraglide/runtime"

export const Route = createFileRoute("/{-$lang}/products/")({
  ...productListRouteSearch,
  loaderDeps: ({ search }) => search,
  /**
   * The server fetches the page the URL asks for, so the first HTML already lists the products. On
   * the client a new page, filter or sort does not wait here: the list keeps the page on screen
   * while the next one loads.
   */
  loader: ({ context: { queryClient }, deps, cause }) =>
    loadProductList(queryClient, deps, { wait: cause !== "stay" }),
  head: ({ match, loaderData }) => {
    const facts = getProductListFacts(match.search, loaderData?.data, loaderData?.categories)
    const { title, description } = getProductListText(facts, {
      title: m.products_title(),
      searchTitle: (query) => m.products_meta_search_title({ query }),
      pageTitle: (base, page) => m.products_meta_page_title({ title: base, page }),
      description: m.products_meta_description(),
      listDescription: (count) => m.products_meta_list_description({ count }),
      categoryDescription: (count, category) =>
        m.products_meta_category_description({ count, category }),
      searchDescription: (count, query) => m.products_meta_search_description({ count, query })
    })
    const href = getProductsCanonicalHref(match.search)
    const url = localizedUrl(href, getLocale())
    const image = facts.image ? { url: facts.image, alt: title } : null

    return {
      meta: [
        { title: `${title} · ${siteConfig.name}` },
        { name: "description", content: description },
        ...getShareMeta({ title, description, url, image }),
        // Search results are not pages of their own; their links are still followed.
        ...(facts.query ? [{ name: "robots", content: "noindex, follow" }] : [])
      ],
      links: [{ rel: "canonical", href: url }, ...hreflangLinks(href)]
    }
  },
  pendingComponent: () => (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <ProductListSkeleton />
    </main>
  ),
  component: ProductsPage
})

function ProductsPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">{m.products_title()}</h1>
      <ProductList />
    </main>
  )
}
