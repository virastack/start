import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { loadProductList } from "@/features/products/api/load-products"
import { ProductList } from "@/features/products/components/ProductList"
import { ProductListSkeleton } from "@/features/products/components/ProductListSkeleton"
import { getProductsCanonicalHref } from "@/features/products/helpers/product-href"
import { getProductListFacts, getProductListText } from "@/features/products/helpers/product-seo"
import { getShareMeta } from "@/features/products/helpers/share-meta"
import { productListRouteSearch } from "@/features/products/schemas/product-list-params.schema"

export const Route = createFileRoute("/products/")({
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
    const { title, description } = getProductListText(facts)
    const url = `${siteConfig.url}${getProductsCanonicalHref(match.search)}`
    const image = facts.image ? { url: facts.image, alt: title } : null

    return {
      meta: [
        { title: `${title} · ${siteConfig.name}` },
        { name: "description", content: description },
        ...getShareMeta({ title, description, url, image }),
        // Search results are not pages of their own; their links are still followed.
        ...(facts.query ? [{ name: "robots", content: "noindex, follow" }] : [])
      ],
      links: [{ rel: "canonical", href: url }]
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
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      <ProductList />
    </main>
  )
}
