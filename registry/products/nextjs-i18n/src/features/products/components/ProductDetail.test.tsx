import type { ComponentProps, ReactNode } from "react"

import { useQueryClient } from "@tanstack/react-query"
import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { delay } from "msw"
import { http, HttpResponse } from "msw/http"
import { toast } from "sonner"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"

import { siteConfig } from "@/config/site.config"

import { getInitialProduct } from "@/features/products/api/get-initial-product.api"
import { productKeys } from "@/features/products/api/query-keys"
import { ProductDetail } from "@/features/products/components/ProductDetail"
import { PRODUCTS_PATH } from "@/features/products/constants/products.constants"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

// next-intl's navigation imports `next/navigation` in a way Vitest cannot resolve, and the tests
// only need the link's markup.
vi.mock("@/i18n/routing", () => ({
  Link: ({ href, ...props }: ComponentProps<"a"> & { href: string }) => <a href={href} {...props} />
}))

const params = vi.hoisted(() => ({ id: "1" }))
vi.mock("next/navigation", () => ({ useParams: () => params }))
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

const PRODUCT_URL = `${siteConfig.apiUrl}${PRODUCTS_PATH}/:id`

const card = {
  id: 1,
  title: "Red Lipstick",
  brand: "Chic Cosmetics",
  category: "beauty",
  price: 10,
  discountPercentage: 10,
  rating: 4.4,
  availabilityStatus: "Low Stock",
  thumbnail: "https://cdn.dummyjson.com/1/thumbnail.webp"
}

const lipstick = {
  ...card,
  description: "A bold red that lasts all day.",
  images: ["https://cdn.dummyjson.com/1/1.webp", "https://cdn.dummyjson.com/1/2.webp"],
  tags: ["beauty", "lipstick"],
  sku: "BEA-CHI-LIP-004",
  stock: 4,
  weight: 1,
  dimensions: { width: 1, height: 2, depth: 3 },
  warrantyInformation: "1 year warranty",
  shippingInformation: "Ships overnight",
  returnPolicy: "30 days return policy",
  minimumOrderQuantity: 2,
  reviews: [
    {
      rating: 5,
      comment: "Great colour!",
      date: "2025-04-30T09:41:02.053Z",
      reviewerName: "Ada Lovelace",
      reviewerEmail: "ada@x.dummyjson.com"
    }
  ]
}

// jsdom has no layout, so the carousel finds none of the browser APIs it watches.
beforeAll(() => {
  class Observer {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", Observer)
  vi.stubGlobal("IntersectionObserver", Observer)
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  )
})

beforeEach(() => {
  params.id = "1"
})

/** Long enough for a request the component would send after its first render. */
function settle() {
  return new Promise((resolve) => setTimeout(resolve, 100))
}

describe("ProductDetail", () => {
  it("shows a loading state, then the whole product", async () => {
    server.use(http.get(PRODUCT_URL, () => HttpResponse.json(lipstick)))
    renderWithProviders(<ProductDetail />)

    expect(screen.getByRole("status", { name: "Loading product" })).toBeInTheDocument()

    expect(
      await screen.findByRole("heading", { level: 1, name: "Red Lipstick" })
    ).toBeInTheDocument()
    expect(screen.getByText("A bold red that lasts all day.")).toBeInTheDocument()
    expect(screen.getByText("Sale price $10.00, was $11.11")).toBeInTheDocument()
    expect(screen.getByText("Low stock")).toBeInTheDocument()
    expect(screen.getByText("4 in stock")).toBeInTheDocument()
    expect(screen.getByText("30 days return policy")).toBeInTheDocument()
    expect(screen.getByText("Great colour!")).toBeInTheDocument()
    // Reviewer emails are dropped by the schema, so they never reach the page.
    expect(screen.queryByText(/ada@x/)).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "All products" })).toHaveAttribute("href", "/products")
  })

  it("confirms an add to cart with a toast", async () => {
    server.use(http.get(PRODUCT_URL, () => HttpResponse.json(lipstick)))
    const user = userEvent.setup()
    renderWithProviders(<ProductDetail />)

    await user.click(await screen.findByRole("button", { name: "Add to cart" }))

    expect(toast.success).toHaveBeenCalledWith("Added to cart", { description: "Red Lipstick" })
  })

  it("cannot add a product that is out of stock", async () => {
    server.use(
      http.get(PRODUCT_URL, () =>
        HttpResponse.json({ ...lipstick, availabilityStatus: "Out of Stock", stock: 0 })
      )
    )
    renderWithProviders(<ProductDetail />)

    expect(await screen.findByRole("button", { name: "Out of stock" })).toBeDisabled()
  })

  it("switches the large image from its thumbnails", async () => {
    server.use(http.get(PRODUCT_URL, () => HttpResponse.json(lipstick)))
    const user = userEvent.setup()
    renderWithProviders(<ProductDetail />)

    // Only the slide in view can take focus; the others are inert.
    expect(await screen.findByRole("group", { name: "1 of 2" })).not.toHaveAttribute("inert")
    expect(screen.getByRole("group", { name: "2 of 2" })).toHaveAttribute("inert")
    const second = screen.getByRole("button", { name: "Show image 2 of 2" })
    await user.click(second)
    expect(screen.getByRole("group", { name: "1 of 2" })).toHaveAttribute("inert")
    expect(screen.getByRole("group", { name: "2 of 2" })).not.toHaveAttribute("inert")

    expect(second).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Show image 1 of 2" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(screen.getByRole("button", { name: "Next image" })).toBeInTheDocument()
  })

  it("opens the images full screen and keeps the image picked there", async () => {
    server.use(http.get(PRODUCT_URL, () => HttpResponse.json(lipstick)))
    const user = userEvent.setup()
    renderWithProviders(<ProductDetail />)

    const opener = await screen.findByRole("button", {
      name: "Open image 1 of 2 in full screen"
    })
    await user.click(opener)

    const viewer = await screen.findByRole("dialog", { name: "Red Lipstick" })
    await user.click(within(viewer).getByRole("button", { name: "Show image 2 of 2" }))
    expect(within(viewer).getByRole("button", { name: "Show image 2 of 2" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )

    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Show image 2 of 2" })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    // Focus lands on the image now on screen, not the one the viewer was opened from.
    expect(screen.getByRole("button", { name: "Open image 2 of 2 in full screen" })).toHaveFocus()
  })

  it("marks a favourite over the image and says so", async () => {
    server.use(http.get(PRODUCT_URL, () => HttpResponse.json(lipstick)))
    const user = userEvent.setup()
    renderWithProviders(<ProductDetail />)

    const favorite = await screen.findByRole("button", { name: "Favorite" })
    await user.click(favorite)

    expect(favorite).toHaveAttribute("aria-pressed", "true")
    expect(toast.success).toHaveBeenCalledWith("Added to favorites", {
      description: "Red Lipstick"
    })
  })

  it("shows the list card's fields at once while the rest loads", async () => {
    server.use(
      http.get(PRODUCT_URL, async () => {
        await delay(100)
        return HttpResponse.json(lipstick)
      })
    )
    function SeedList({ children }: { children: ReactNode }) {
      useQueryClient().setQueryData(
        productKeys.list({ q: "", category: "", sort: "featured", page: 1 }),
        { products: [card], total: 1, skip: 0, limit: 24 }
      )
      return children
    }
    renderWithProviders(
      <SeedList>
        <ProductDetail />
      </SeedList>
    )

    expect(screen.getByRole("heading", { level: 1, name: "Red Lipstick" })).toBeInTheDocument()
    expect(screen.queryByText("A bold red that lasts all day.")).not.toBeInTheDocument()
    expect(await screen.findByText("A bold red that lasts all day.")).toBeInTheDocument()
  })

  it("says the product is not found for an unknown id", async () => {
    server.use(
      http.get(PRODUCT_URL, () =>
        HttpResponse.json({ message: "Product with id '9999' not found" }, { status: 404 })
      )
    )
    params.id = "9999"
    renderWithProviders(<ProductDetail />)

    expect(await screen.findByText("Product not found")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "All products" })).toHaveAttribute("href", "/products")
  })

  it("trusts the server's not found, without asking the API again", async () => {
    let calls = 0
    server.use(
      http.get(PRODUCT_URL, () => {
        calls += 1
        return HttpResponse.json({ message: "Product with id '9999' not found" }, { status: 404 })
      })
    )
    params.id = "9999"

    const initial = await getInitialProduct(Promise.resolve({ id: "9999" }))
    expect(initial).toMatchObject({ product: null, notFound: true })
    renderWithProviders(<ProductDetail initialProduct={initial} />)

    expect(screen.getByText("Product not found")).toBeInTheDocument()
    await settle()
    expect(calls).toBe(1)
  })

  it.each(["abc", "0", "01", "1.0", "1e2", "0x10"])(
    "does not ask the API for %s, which is not a product id",
    async (id) => {
      let calls = 0
      server.use(
        http.get(PRODUCT_URL, () => {
          calls += 1
          return HttpResponse.json(lipstick)
        })
      )
      params.id = id
      renderWithProviders(<ProductDetail />)

      expect(screen.getByText("Product not found")).toBeInTheDocument()
      await expect(getInitialProduct(Promise.resolve({ id }))).resolves.toMatchObject({
        product: null,
        notFound: true
      })
      await settle()
      expect(calls).toBe(0)
    }
  )

  it("shows the error and retries", async () => {
    let calls = 0
    server.use(
      http.get(PRODUCT_URL, () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json({ message: "Down" }, { status: 500 })
          : HttpResponse.json(lipstick)
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<ProductDetail />)

    const alert = await screen.findByRole("alert")
    await user.click(within(alert).getByRole("button", { name: "Retry" }))

    expect(
      await screen.findByRole("heading", { level: 1, name: "Red Lipstick" })
    ).toBeInTheDocument()
  })

  it("renders the server's product without a request from the client", async () => {
    let calls = 0
    server.use(
      http.get(PRODUCT_URL, () => {
        calls += 1
        return HttpResponse.json(lipstick)
      })
    )

    const initial = await getInitialProduct(Promise.resolve({ id: "1" }))
    renderWithProviders(<ProductDetail initialProduct={initial} />)

    expect(screen.getByRole("heading", { level: 1, name: "Red Lipstick" })).toBeInTheDocument()
    await settle()
    expect(calls).toBe(1)
  })
})
