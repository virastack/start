import { describe, expect, it } from "vitest"

import {
  getProductJsonLd,
  getProductListFacts,
  getProductListText,
  toJsonLd
} from "@/features/products/helpers/product-seo"
import type { ProductDetails } from "@/features/products/schemas/product.schema"

const lipstick: ProductDetails = {
  id: 1,
  title: "Red Lipstick",
  brand: "Chic Cosmetics",
  category: "beauty",
  price: 9,
  discountPercentage: 10,
  rating: 4.4,
  availabilityStatus: "Low Stock",
  thumbnail: "https://cdn.dummyjson.com/1/thumbnail.webp",
  description: "A bold red.",
  images: ["https://cdn.dummyjson.com/1/1.webp"],
  tags: [],
  sku: "BEA-CHI-LIP-004",
  stock: 4,
  dimensions: { width: 1, height: 2, depth: 3 },
  warrantyInformation: "",
  shippingInformation: "",
  returnPolicy: "",
  minimumOrderQuantity: 1,
  reviews: [{ rating: 5, comment: "Great", date: "2025-04-30T09:41:02.053Z", reviewerName: "Ada" }]
}

describe("getProductJsonLd", () => {
  it("describes the product with its current price, stock and rating", () => {
    expect(getProductJsonLd(lipstick, "https://shop.test/products/1")).toEqual({
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Red Lipstick",
      description: "A bold red.",
      image: ["https://cdn.dummyjson.com/1/1.webp"],
      sku: "BEA-CHI-LIP-004",
      brand: { "@type": "Brand", name: "Chic Cosmetics" },
      category: "beauty",
      offers: {
        "@type": "Offer",
        price: 9,
        priceCurrency: "USD",
        availability: "https://schema.org/LimitedAvailability",
        url: "https://shop.test/products/1"
      },
      aggregateRating: { "@type": "AggregateRating", ratingValue: 4.4, reviewCount: 1 }
    })
  })

  it("leaves out a brand it does not have and a rating no review backs", () => {
    const plain = getProductJsonLd(
      { ...lipstick, brand: undefined, reviews: [] },
      "https://shop.test/products/1"
    )
    expect(plain).not.toHaveProperty("brand")
    expect(plain).not.toHaveProperty("aggregateRating")
  })
})

describe("toJsonLd", () => {
  it("cannot close the script tag it goes in", () => {
    const json = toJsonLd({ name: "</script><script>alert(1)</script>" })
    expect(json).not.toContain("<")
    expect(JSON.parse(json)).toEqual({ name: "</script><script>alert(1)</script>" })
  })
})

describe("getProductListText", () => {
  const page = {
    products: [{ ...lipstick, discountPercentage: 10 }],
    total: 16,
    skip: 0,
    limit: 24
  }
  const categories = [{ slug: "smartphones", name: "Smartphones" }]

  it("names the category and the page, and counts from the server's data", () => {
    const facts = getProductListFacts({ q: "", category: "smartphones", page: 2 }, page, categories)
    expect(facts.image).toBe(lipstick.thumbnail)
    expect(getProductListText(facts)).toEqual({
      title: "Smartphones · Page 2",
      description: "Browse 16 products in Smartphones and sort them by price, rating or discount."
    })
  })

  it("gives a search its own title, whatever the category", () => {
    const facts = getProductListFacts(
      { q: " phone ", category: "smartphones", page: 1 },
      page,
      categories
    )
    expect(getProductListText(facts)).toEqual({
      title: "Results for “phone”",
      description: "16 results for “phone”."
    })
  })

  it("falls back to the general words without the server's data", () => {
    const facts = getProductListFacts({ q: "", category: "", page: 1 }, null, null)
    expect(facts.image).toBeNull()
    expect(getProductListText(facts)).toEqual({
      title: "Products",
      description: "Browse the products, search them and sort them by price, rating or discount."
    })
  })
})
