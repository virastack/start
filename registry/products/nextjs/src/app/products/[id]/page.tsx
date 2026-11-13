import { cache } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { defaultMetadata } from "@/config/seo.config"
import { siteConfig } from "@/config/site.config"

import { getInitialProduct } from "@/features/products/api/get-initial-product.api"
import { ProductDetail } from "@/features/products/components/ProductDetail"
import { getProductHref } from "@/features/products/helpers/product-href"
import {
  getProductImage,
  getProductJsonLd,
  toJsonLd
} from "@/features/products/helpers/product-seo"

type PageProps = {
  params: Promise<{ id: string }>
}

// The metadata and the page both need the product, so they share one request per render.
const loadProduct = cache((id: string) => getInitialProduct(Promise.resolve({ id })))

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product } = await loadProduct((await params).id)
  // A request that failed; the page leaves the product to the client. A missing product never
  // gets here with metadata of its own, since the page calls `notFound()`.
  if (!product) return { title: "Product" }

  const { title, description } = product
  const url = getProductHref(product.id)
  const images = [{ url: getProductImage(product), alt: title }]

  return {
    title,
    description,
    alternates: { canonical: url },
    // A page replaces the whole `openGraph` and `twitter` of the layout, so the site's stay in.
    openGraph: { ...defaultMetadata.openGraph, title, description, url, images },
    twitter: { ...defaultMetadata.twitter, title, description, images }
  }
}

/**
 * The server fetches the product, so its HTML already has it, and a product that does not exist
 * answers with a real 404. A request that fails otherwise leaves the product to the client.
 */
export default async function Page({ params }: PageProps) {
  const initialProduct = await loadProduct((await params).id)
  if (initialProduct.notFound) notFound()
  const { product } = initialProduct

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
      {product && (
        // Product data for search results, as Next.js advises: a script in the page.
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLd(
              getProductJsonLd(product, `${siteConfig.url}${getProductHref(product.id)}`)
            )
          }}
        />
      )}
      <ProductDetail initialProduct={initialProduct} />
    </main>
  )
}
