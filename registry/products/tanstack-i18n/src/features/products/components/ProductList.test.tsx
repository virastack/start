import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { delay } from "msw"
import { http, HttpResponse } from "msw/http"
import { beforeAll, describe, expect, it, vi } from "vitest"

import { siteConfig } from "@/config/site.config"

import { ProductList } from "@/features/products/components/ProductList"
import {
  MAX_PAGE,
  PRODUCTS_PAGE_SIZE,
  PRODUCTS_PATH
} from "@/features/products/constants/products.constants"
import { productListRouteSearch } from "@/features/products/schemas/product-list-params.schema"
import { renderWithProviders } from "@/test/render"
import type { UrlUpdateEvent } from "@/test/render"
import { server } from "@/test/server"

const PRODUCTS_URL = `${siteConfig.apiUrl}${PRODUCTS_PATH}`

// jsdom does not lay out the page, so it has nothing to scroll.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

function productNamed(id: number, title: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    title,
    brand: "Acme",
    category: "beauty",
    price: 10,
    discountPercentage: 0,
    rating: 4.5,
    availabilityStatus: "In Stock",
    thumbnail: `https://cdn.dummyjson.com/${id}.webp`,
    ...extra
  }
}

function pageOf(titles: string[], { total = titles.length, skip = 0, extra = {} } = {}) {
  return {
    products: titles.map((title, index) => productNamed(skip + index + 1, title, extra)),
    total,
    skip,
    limit: titles.length
  }
}

function mockCategories() {
  server.use(
    http.get(`${PRODUCTS_URL}/categories`, () =>
      HttpResponse.json([{ slug: "beauty", name: "Beauty", url: "" }])
    )
  )
}

function renderList(searchParams = "", onUrlUpdate?: (event: UrlUpdateEvent) => void) {
  mockCategories()
  return renderWithProviders(<ProductList />, {
    route: { path: "/products", ...productListRouteSearch },
    searchParams,
    onUrlUpdate
  })
}

describe("ProductList", () => {
  it("shows a loading state, then the products", async () => {
    server.use(http.get(PRODUCTS_URL, () => HttpResponse.json(pageOf(["Lipstick", "Perfume"]))))
    renderList()

    expect(await screen.findByRole("status", { name: "Loading products" })).toBeInTheDocument()

    const list = await screen.findByRole("list", { name: "Products" })
    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(screen.getByText("1–2 of 2 products")).toBeInTheDocument()
    // One page needs no pagination.
    expect(screen.queryByRole("navigation", { name: "Pagination" })).not.toBeInTheDocument()
    expect(within(list).getByRole("link", { name: "Lipstick" })).toHaveAttribute(
      "href",
      "/products/1"
    )
  })

  it("reads a sale price as one sentence", async () => {
    server.use(
      http.get(PRODUCTS_URL, () =>
        HttpResponse.json(
          pageOf(["Lipstick"], {
            extra: { discountPercentage: 10, availabilityStatus: "Low Stock" }
          })
        )
      )
    )
    renderList()

    expect(await screen.findByText("Sale price $10.00, was $11.11")).toBeInTheDocument()
    expect(screen.getByText("-10%")).toBeInTheDocument()
    expect(screen.getByText("Low stock")).toBeInTheDocument()
  })

  it("pages on the client, keeps the filters in the URL and moves focus to the summary", async () => {
    const skips: number[] = []
    server.use(
      http.get(`${PRODUCTS_URL}/category/beauty`, ({ request }) => {
        const skip = Number(new URL(request.url).searchParams.get("skip"))
        skips.push(skip)
        return HttpResponse.json(
          pageOf([skip === 0 ? "Lipstick" : "Mascara"], { total: PRODUCTS_PAGE_SIZE + 1, skip })
        )
      })
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderList("?category=beauty&sort=rating", onUrlUpdate)

    expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()
    const next = screen.getByRole("button", { name: "Next page" })
    // A real link, for search engines and readers without JavaScript.
    expect(next).toHaveAttribute("href", "/products?category=beauty&sort=rating&page=2")
    await user.click(next)

    expect(await screen.findByRole("heading", { name: "Mascara" })).toBeInTheDocument()
    expect(screen.getByText("25–25 of 25 products")).toHaveFocus()
    expect(skips).toEqual([0, PRODUCTS_PAGE_SIZE])
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryString: "?category=beauty&sort=rating&page=2" })
    )
    expect(screen.getByRole("button", { name: "Next page" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
  })

  it("opens the page in the URL", async () => {
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        const skip = Number(new URL(request.url).searchParams.get("skip"))
        return HttpResponse.json(pageOf([`Item at ${skip}`], { total: 60, skip }))
      })
    )
    renderList("?page=3")

    expect(await screen.findByRole("heading", { name: "Item at 48" })).toBeInTheDocument()
    expect(screen.getByText("Page 3 of 3")).toBeInTheDocument()
  })

  it("offers the first page when the URL's page is past the end", async () => {
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        const skip = Number(new URL(request.url).searchParams.get("skip"))
        return HttpResponse.json(
          skip === 0 ? pageOf(["Lipstick"], { total: 1 }) : pageOf([], { total: 1, skip })
        )
      })
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderList("?page=9", onUrlUpdate)

    expect(await screen.findByText("The results end before page 9.")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Go to the first page" }))

    expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
    expect(onUrlUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ queryString: "" }))
  })

  it("starts a new sort from the first page", async () => {
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        const params = new URL(request.url).searchParams
        const title = params.get("sortBy") === "rating" ? "Best" : `Page at ${params.get("skip")}`
        return HttpResponse.json(pageOf([title], { total: 60 }))
      })
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderList("?page=2", onUrlUpdate)

    expect(await screen.findByRole("heading", { name: "Page at 24" })).toBeInTheDocument()
    await user.click(screen.getByRole("combobox", { name: "Sort by" }))
    await user.click(await screen.findByRole("option", { name: "Top rated" }))

    expect(await screen.findByRole("heading", { name: "Best" })).toBeInTheDocument()
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryString: "?sort=rating" })
    )
  })

  it("offers a retry when the next page fails, and stays on it", async () => {
    let failed = false
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        const skip = Number(new URL(request.url).searchParams.get("skip"))
        if (skip === 0) return HttpResponse.json(pageOf(["Lipstick"], { total: 30 }))
        if (!failed) {
          failed = true
          return HttpResponse.json({ message: "Down" }, { status: 500 })
        }
        return HttpResponse.json(pageOf(["Mascara"], { total: 30, skip }))
      })
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderList("", onUrlUpdate)

    await user.click(await screen.findByRole("button", { name: "Next page" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load products")
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryString: "?page=2" })
    )
    await user.click(screen.getByRole("button", { name: "Retry" }))

    expect(await screen.findByRole("heading", { name: "Mascara" })).toBeInTheDocument()
  })

  it("opens the category and sort stored in the URL", async () => {
    server.use(
      http.get(`${PRODUCTS_URL}/category/beauty`, ({ request }) => {
        const matches = new URL(request.url).searchParams.get("sortBy") === "price"
        return HttpResponse.json(pageOf([matches ? "Lipstick" : "Wrong"]))
      })
    )
    renderList("?category=beauty&sort=price-asc")

    expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
  })

  it.each([".", ".."])(
    "ignores the category %s, which would change the request path",
    async (slug) => {
      server.use(http.get(PRODUCTS_URL, () => HttpResponse.json(pageOf(["Lipstick"]))))
      renderList(`?category=${slug}`)

      expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
      // Read as no category at all, so the select offers every one.
      expect(screen.getByRole("combobox", { name: "Category" })).toHaveTextContent("All categories")
    }
  )

  it("describes the page on screen while the next one loads", async () => {
    server.use(
      http.get(PRODUCTS_URL, async ({ request }) => {
        const skip = Number(new URL(request.url).searchParams.get("skip"))
        if (skip > 0) await delay(150)
        return HttpResponse.json(pageOf([skip === 0 ? "Lipstick" : "Mascara"], { total: 30, skip }))
      })
    )
    const user = userEvent.setup()
    renderList()

    await user.click(await screen.findByRole("button", { name: "Next page" }))

    // The old page is still the one shown, so its range and positions stay.
    expect(screen.getByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
    expect(screen.getByText("1–1 of 30 products")).toBeInTheDocument()
    const card = () => within(screen.getByRole("list", { name: "Products" })).getByRole("listitem")
    expect(card()).toHaveAttribute("aria-posinset", "1")
    expect(await screen.findByText("25–25 of 30 products")).toBeInTheDocument()
    expect(card()).toHaveAttribute("aria-posinset", "25")
  })

  it("does not say an old search matched nothing while a new one loads", async () => {
    server.use(
      http.get(`${PRODUCTS_URL}/search`, async ({ request }) => {
        const q = new URL(request.url).searchParams.get("q")
        if (q === "zzza") return HttpResponse.json(pageOf([]))
        await delay(150)
        return HttpResponse.json(pageOf(["Phone"]))
      })
    )
    const user = userEvent.setup()
    renderList("?q=zzza")

    expect(await screen.findByText("Nothing matches “zzza”.")).toBeInTheDocument()
    const input = screen.getByLabelText("Search products")
    await user.clear(input)
    await user.type(input, "phone")
    await waitFor(() => expect(screen.queryByText(/Nothing matches/)).not.toBeInTheDocument())
    expect(screen.queryByText("No products found")).not.toBeInTheDocument()

    expect(await screen.findByRole("heading", { name: "Phone" })).toBeInTheDocument()
  })

  it("resets the page together with the search, without a request in between", async () => {
    const requests: string[] = []
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        const url = new URL(request.url)
        requests.push(`list ${url.searchParams.get("skip")}`)
        return HttpResponse.json(pageOf(["Lipstick"], { total: 60, skip: 24 }))
      }),
      http.get(`${PRODUCTS_URL}/search`, ({ request }) => {
        const url = new URL(request.url)
        requests.push(`search ${url.searchParams.get("q")} ${url.searchParams.get("skip")}`)
        return HttpResponse.json(pageOf(["Phone"]))
      })
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderList("?page=2", onUrlUpdate)

    await user.type(await screen.findByLabelText("Search products"), "phone")

    expect(await screen.findByRole("heading", { name: "Phone" })).toBeInTheDocument()
    expect(requests).toEqual(["list 24", "search phone 0"])
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryString: "?q=phone" })
    )
  })

  it("applies an emptied search at once, without waiting for a pause", async () => {
    server.use(
      http.get(PRODUCTS_URL, () => HttpResponse.json(pageOf(["Lipstick"]))),
      http.get(`${PRODUCTS_URL}/search`, () => HttpResponse.json(pageOf(["Phone"])))
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderList("?q=phone", onUrlUpdate)

    await user.clear(await screen.findByLabelText("Search products"))

    // Well under the 300 ms a typed search waits.
    await waitFor(
      () =>
        expect(onUrlUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ queryString: "" })),
      { timeout: 150 }
    )
    expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
  })

  it.each([
    ["abc", 0],
    ["2.5", 0],
    ["-3", 0],
    ["01", 0],
    ["010", 9 * PRODUCTS_PAGE_SIZE],
    ["1e1", 9 * PRODUCTS_PAGE_SIZE],
    ["2.0", PRODUCTS_PAGE_SIZE]
  ])("reads ?page=%s as the whole number it spells, or as the first page", async (page, skip) => {
    const skips: number[] = []
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        skips.push(Number(new URL(request.url).searchParams.get("skip")))
        return HttpResponse.json(pageOf(["Lipstick"]))
      })
    )
    renderList(`?page=${page}`)

    expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
    expect(skips).toEqual([skip])
  })

  it("shows an empty page, not a failing request, for a huge page number", async () => {
    const skips: string[] = []
    server.use(
      http.get(PRODUCTS_URL, ({ request }) => {
        const skip = new URL(request.url).searchParams.get("skip") ?? ""
        skips.push(skip)
        return HttpResponse.json(pageOf([], { total: 194, skip: Number(skip) }))
      })
    )
    renderList("?page=99999999999999999999")

    expect(await screen.findByText("This page is empty")).toBeInTheDocument()
    expect(skips).toEqual([String((MAX_PAGE - 1) * PRODUCTS_PAGE_SIZE)])
  })

  it("searches every category and keeps the search in the URL", async () => {
    server.use(
      http.get(PRODUCTS_URL, () => HttpResponse.json(pageOf(["Lipstick"]))),
      http.get(`${PRODUCTS_URL}/search`, ({ request }) =>
        HttpResponse.json(pageOf([`Found ${new URL(request.url).searchParams.get("q")}`]))
      )
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderList("", onUrlUpdate)

    await user.type(await screen.findByLabelText("Search products"), "phone")

    expect(await screen.findByRole("heading", { name: "Found phone" })).toBeInTheDocument()
    expect(screen.getByText("1–1 of 1 result for “phone”")).toBeInTheDocument()
    expect(onUrlUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({ queryString: "?q=phone" })
    )
  })

  it("offers to clear filters when nothing matches", async () => {
    server.use(
      http.get(`${PRODUCTS_URL}/category/beauty`, () => HttpResponse.json(pageOf([]))),
      http.get(PRODUCTS_URL, () => HttpResponse.json(pageOf(["Lipstick"])))
    )
    const user = userEvent.setup()
    renderList("?category=beauty")

    await user.click(await screen.findByRole("button", { name: "Clear filters" }))

    expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
  })

  it("shows the error and retries", async () => {
    let calls = 0
    server.use(
      http.get(PRODUCTS_URL, () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json({ message: "Down" }, { status: 500 })
          : HttpResponse.json(pageOf(["Lipstick"]))
      })
    )
    const user = userEvent.setup()
    renderList()

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load products")
    await user.click(screen.getByRole("button", { name: "Retry" }))

    expect(await screen.findByRole("heading", { name: "Lipstick" })).toBeInTheDocument()
  })
})
