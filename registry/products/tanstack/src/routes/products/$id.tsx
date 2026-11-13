import { createFileRoute } from "@tanstack/react-router"

import { siteConfig } from "@/config/site.config"

import { loadProduct } from "@/features/products/api/load-products"
import { ProductDetail } from "@/features/products/components/ProductDetail"
import { ProductDetailSkeleton } from "@/features/products/components/ProductDetailSkeleton"
import { ProductNotFound } from "@/features/products/components/ProductNotFound"
import { getProductHref } from "@/features/products/helpers/product-href"
import {
  getProductImage,
  getProductJsonLd,
  toJsonLd
} from "@/features/products/helpers/product-seo"
import { getShareMeta } from "@/features/products/helpers/share-meta"

export const Route = createFileRoute("/products/$id")({
  /**
   * The server fetches the product, so its HTML already has it, and a product that does not exist
   * answers with a real 404. A request that fails otherwise leaves the product to the client.
   */
  loader: ({ context: { queryClient }, params }) => loadProduct(queryClient, params.id),
  head: ({ loaderData: product }) => {
    // A request that failed: the product is left to the client, and so is everything else here.
    if (!product) return { meta: [{ title: `Product · ${siteConfig.name}` }] }

    const { title, description } = product
    const url = `${siteConfig.url}${getProductHref(product.id)}`

    return {
      meta: [
        { title: `${title} · ${siteConfig.name}` },
        { name: "description", content: description },
        ...getShareMeta({
          title,
          description,
          url,
          image: { url: getProductImage(product), alt: title }
        })
      ],
      links: [{ rel: "canonical", href: url }],
      // Product data for search results.
      scripts: [{ type: "application/ld+json", children: toJsonLd(getProductJsonLd(product, url)) }]
    }
  },
  pendingComponent: () => (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
      <ProductDetailSkeleton />
    </main>
  ),
  // The loader's `notFound()`: the module's own state, with the way back to the list.
  notFoundComponent: () => (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
      <ProductNotFound />
    </main>
  ),
  component: ProductPage
})

function ProductPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
      <ProductDetail />
    </main>
  )
}
