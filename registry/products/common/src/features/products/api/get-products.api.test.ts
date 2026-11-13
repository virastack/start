import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { getProducts } from "@/features/products/api/get-products.api"
import { PRODUCTS_PATH } from "@/features/products/constants/products.constants"
import { server } from "@/test/server"

const PRODUCTS_URL = `${siteConfig.apiUrl}${PRODUCTS_PATH}`

const mascara = {
  id: 1,
  title: "Essence Mascara Lash Princess",
  brand: "Essence",
  price: 9.99,
  discountPercentage: 10.48,
  rating: 2.56,
  availabilityStatus: "In Stock",
  thumbnail:
    "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp"
}

function pageOf(products: unknown[], skip = 0) {
  return { products, total: products.length, skip, limit: 24 }
}

function captureParams(url: string) {
  const captured: { params?: URLSearchParams } = {}
  server.use(
    http.get(url, ({ request }) => {
      captured.params = new URL(request.url).searchParams
      return HttpResponse.json(pageOf([mascara], 48))
    })
  )
  return captured
}

describe("getProducts", () => {
  it("asks for the page's products and only for the card's fields", async () => {
    const captured = captureParams(PRODUCTS_URL)

    await expect(getProducts({ page: 3, q: "", category: "", sort: "featured" })).resolves.toEqual(
      pageOf([mascara], 48)
    )
    expect(captured.params?.get("limit")).toBe("24")
    expect(captured.params?.get("skip")).toBe("48")
    expect(captured.params?.get("select")).toContain("thumbnail")
    expect(captured.params?.has("q")).toBe(false)
    expect(captured.params?.has("sortBy")).toBe(false)
  })

  it("searches on its own endpoint, even with a category", async () => {
    const captured = captureParams(`${PRODUCTS_URL}/search`)

    await getProducts({ page: 1, q: "phone", category: "beauty", sort: "price-desc" })
    expect(captured.params?.get("q")).toBe("phone")
    expect(captured.params?.get("sortBy")).toBe("price")
    expect(captured.params?.get("order")).toBe("desc")
  })

  it("lists a category on its own endpoint", async () => {
    const captured = captureParams(`${PRODUCTS_URL}/category/smartphones`)

    await getProducts({ page: 1, q: "", category: "smartphones", sort: "discount" })
    expect(captured.params?.get("sortBy")).toBe("discountPercentage")
  })

  it("accepts a product without a brand or a discount", async () => {
    const { brand: _brand, discountPercentage: _discount, ...plain } = mascara
    server.use(http.get(PRODUCTS_URL, () => HttpResponse.json(pageOf([plain]))))

    const { products } = await getProducts({ page: 1, q: "", category: "", sort: "featured" })
    expect(products[0]?.brand).toBeUndefined()
    expect(products[0]?.discountPercentage).toBe(0)
  })
})
