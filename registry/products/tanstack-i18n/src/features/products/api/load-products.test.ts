import { QueryClient } from "@tanstack/react-query"
import { isNotFound } from "@tanstack/react-router"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { loadProduct, loadProductList } from "@/features/products/api/load-products"
import { productsQueryOptions } from "@/features/products/api/product.queries"
import { PRODUCTS_PATH } from "@/features/products/constants/products.constants"
import { server } from "@/test/server"

const PRODUCTS_URL = `${siteConfig.apiUrl}${PRODUCTS_PATH}`
const filters = { q: "", category: "", sort: "featured" as const, page: 2 }
const lipstick = {
  id: 1,
  title: "Red Lipstick",
  price: 10,
  rating: 4.4,
  availabilityStatus: "In Stock",
  thumbnail: "https://cdn.dummyjson.com/1/thumbnail.webp",
  description: "A bold red.",
  images: ["https://cdn.dummyjson.com/1/1.webp"],
  tags: [],
  sku: "SKU",
  stock: 4,
  dimensions: { width: 1, height: 2, depth: 3 },
  warrantyInformation: "",
  shippingInformation: "",
  returnPolicy: "",
  minimumOrderQuantity: 1,
  reviews: []
}

describe("loadProductList", () => {
  it("fills the cache for the page in the URL, and a second load asks for nothing", async () => {
    const skips: Array<string | null> = []
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        skips.push(new URL(request.url).searchParams.get("skip"))
        return HttpResponse.json({ products: [], total: 30, skip: 24, limit: 24 })
      }),
      http.get(`${PRODUCTS_URL}/categories`, () => HttpResponse.json([]))
    )
    const queryClient = new QueryClient()

    await loadProductList(queryClient, filters)
    const second = await loadProductList(queryClient, filters)

    expect(skips).toEqual(["24"])
    // What the page's title and description are made from.
    expect(second).toEqual({
      data: { products: [], total: 30, skip: 24, limit: 24 },
      categories: []
    })
    expect(queryClient.getQueryData(productsQueryOptions(filters).queryKey)).toMatchObject({
      total: 30
    })
  })

  it("leaves a failed request to the list instead of failing the route", async () => {
    server.use(
      http.get(PRODUCTS_URL, () => HttpResponse.json({ message: "Down" }, { status: 500 })),
      http.get(`${PRODUCTS_URL}/categories`, () => HttpResponse.json([]))
    )

    await expect(loadProductList(new QueryClient(), filters)).resolves.toEqual({
      data: null,
      categories: []
    })
  })
})

describe("loadProduct", () => {
  it("returns the product the API has", async () => {
    server.use(http.get(`${PRODUCTS_URL}/1`, () => HttpResponse.json(lipstick)))

    await expect(loadProduct(new QueryClient(), "1")).resolves.toMatchObject({
      title: "Red Lipstick"
    })
  })

  it.each(["abc", "01", "1e2", "0"])("is not found for %s, without asking the API", async (id) => {
    const error = await loadProduct(new QueryClient(), id).catch((caught: unknown) => caught)
    expect(isNotFound(error)).toBe(true)
  })

  it("is not found when the API has no such product", async () => {
    server.use(
      http.get(`${PRODUCTS_URL}/9999`, () =>
        HttpResponse.json({ message: "Product with id '9999' not found" }, { status: 404 })
      )
    )

    const error = await loadProduct(new QueryClient(), "9999").catch((caught: unknown) => caught)
    expect(isNotFound(error)).toBe(true)
  })

  it("leaves the product to the client when the API fails otherwise", async () => {
    server.use(
      http.get(`${PRODUCTS_URL}/1`, () => HttpResponse.json({ message: "Down" }, { status: 500 }))
    )

    await expect(loadProduct(new QueryClient(), "1")).resolves.toBeUndefined()
  })
})
