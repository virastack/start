import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { delay } from "msw"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { Cart } from "@/features/cart/components/Cart"
import { CART_PATH } from "@/features/cart/constants/cart.constants"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

const CART_URL = `${siteConfig.apiUrl}${CART_PATH}`
// `Cart` has links, so it renders inside a route.
const CART_PAGE = { path: "/cart" }

const frock = {
  id: 162,
  title: "Blue Frock",
  price: 29.99,
  quantity: 2,
  total: 59.98,
  discountPercentage: 12.13,
  thumbnail: "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp"
}

const ball = {
  id: 138,
  title: "Baseball Ball",
  price: 8.99,
  quantity: 1,
  total: 8.99,
  discountPercentage: 1.71,
  thumbnail:
    "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/thumbnail.webp"
}

type Line = typeof frock

/** DummyJSON's cart: GET answers with these lines, PUT with the lines it was sent. */
function serveCart(lines: Line[] = [frock, ball]) {
  const puts: { products: { id: number; quantity: number }[] }[] = []
  server.use(
    http.get(CART_URL, () => HttpResponse.json({ id: 1, products: lines })),
    http.put(CART_URL, async ({ request }) => {
      const body = (await request.json()) as (typeof puts)[number]
      puts.push(body)
      const products = body.products.flatMap(({ id, quantity }) => {
        const line = lines.find((candidate) => candidate.id === id)
        return line
          ? [{ ...line, quantity, total: Math.round(line.price * quantity * 100) / 100 }]
          : []
      })
      return HttpResponse.json({ id: 1, products })
    })
  )
  return puts
}

async function renderCart() {
  renderWithProviders(<Cart />, { route: CART_PAGE })
  return screen.findByRole("list", { name: "Cart items" })
}

const summary = () => screen.getByRole("region", { name: "Order summary" })
const total = () => within(summary()).getByText("Total").nextElementSibling

describe("Cart", () => {
  it("lists the lines and adds them up", async () => {
    serveCart()
    const list = await renderCart()

    expect(within(list).getAllByRole("listitem")).toHaveLength(2)
    expect(within(list).getByRole("link", { name: "Blue Frock" })).toHaveAttribute(
      "href",
      "/products/162"
    )
    expect(within(summary()).getByText("Subtotal (3 items)")).toBeInTheDocument()
    expect(within(summary()).getByText("-$8.44")).toBeInTheDocument()
    expect(total()).toHaveTextContent("$68.97")
  })

  it("adds up only the selected lines and sends no request for a checkbox", async () => {
    const puts = serveCart()
    const user = userEvent.setup()
    await renderCart()

    await user.click(screen.getByRole("checkbox", { name: "Select Baseball Ball" }))

    await waitFor(() => expect(total()).toHaveTextContent("$59.98"))
    expect(within(summary()).getByText("Subtotal (2 items)")).toBeInTheDocument()
    expect(screen.getByRole("checkbox", { name: "Select all" })).not.toBeChecked()
    expect(puts).toHaveLength(0)
  })

  it("keeps the selection when a quantity changes", async () => {
    serveCart()
    const user = userEvent.setup()
    await renderCart()

    await user.click(screen.getByRole("checkbox", { name: "Select Baseball Ball" }))
    await waitFor(() => expect(total()).toHaveTextContent("$59.98"))
    const frockQuantity = screen.getByRole("group", { name: "Quantity of Blue Frock" })
    await user.click(within(frockQuantity).getByRole("button", { name: "Increase quantity" }))

    await waitFor(() => expect(total()).toHaveTextContent("$89.97"))
    expect(screen.getByRole("checkbox", { name: "Select Baseball Ball" })).not.toBeChecked()
  })

  it("holds checkout until a line is selected", async () => {
    serveCart()
    const user = userEvent.setup()
    await renderCart()

    await user.click(screen.getByRole("checkbox", { name: "Select all" }))

    await waitFor(() => expect(total()).toHaveTextContent("$0.00"))
    expect(within(summary()).getByRole("button", { name: "Proceed to checkout" })).toHaveAttribute(
      "aria-disabled",
      "true"
    )
    expect(
      within(summary()).getByText("Select the products you want to check out.")
    ).toBeInTheDocument()

    await user.click(screen.getByRole("checkbox", { name: "Select all" }))

    await waitFor(() => expect(total()).toHaveTextContent("$68.97"))
    expect(
      within(summary()).getByRole("button", { name: "Proceed to checkout" })
    ).not.toHaveAttribute("aria-disabled", "true")
  })

  it("sends the whole cart when a quantity changes", async () => {
    const puts = serveCart()
    const user = userEvent.setup()
    await renderCart()

    const frockQuantity = screen.getByRole("group", { name: "Quantity of Blue Frock" })
    await user.click(within(frockQuantity).getByRole("button", { name: "Increase quantity" }))

    await waitFor(() => expect(total()).toHaveTextContent("$98.96"))
    expect(puts).toEqual([
      {
        merge: false,
        products: [
          { id: 162, quantity: 3 },
          { id: 138, quantity: 1 }
        ]
      }
    ])
  })

  it("changes the quantity from the list on a narrow cart", async () => {
    const puts = serveCart()
    const user = userEvent.setup()
    await renderCart()

    await user.selectOptions(screen.getByRole("combobox", { name: "Quantity of Blue Frock" }), "5")

    await waitFor(() => expect(total()).toHaveTextContent("$158.94"))
    expect(puts.at(-1)?.products).toEqual([
      { id: 162, quantity: 5 },
      { id: 138, quantity: 1 }
    ])
  })

  it("holds the controls until the cart answers", async () => {
    const puts = serveCart()
    server.use(
      http.put(CART_URL, async ({ request }) => {
        puts.push((await request.json()) as (typeof puts)[number])
        await delay("infinite")
      })
    )
    const user = userEvent.setup()
    await renderCart()

    const increase = within(
      screen.getByRole("group", { name: "Quantity of Blue Frock" })
    ).getByRole("button", { name: "Increase quantity" })
    await user.click(increase)
    await waitFor(() => expect(increase).toHaveAttribute("aria-disabled", "true"))
    await user.click(increase)

    expect(puts).toHaveLength(1)
    expect(increase).toHaveFocus()
  })

  it("turns decrease into remove at one, and keeps the focus on it", async () => {
    serveCart()
    const user = userEvent.setup()
    await renderCart()

    const ballQuantity = screen.getByRole("group", { name: "Quantity of Baseball Ball" })
    expect(within(ballQuantity).queryByRole("button", { name: "Decrease quantity" })).toBeNull()
    expect(
      within(ballQuantity).getByRole("button", { name: "Remove Baseball Ball" })
    ).toBeInTheDocument()

    const frockQuantity = screen.getByRole("group", { name: "Quantity of Blue Frock" })
    const decrease = within(frockQuantity).getByRole("button", { name: "Decrease quantity" })
    await user.click(decrease)

    await waitFor(() => expect(decrease).toHaveAccessibleName("Remove Blue Frock"))
    expect(decrease).toHaveFocus()
  })

  it("removes a line and moves the focus to the list", async () => {
    const puts = serveCart()
    const user = userEvent.setup()
    const list = await renderCart()

    const ballQuantity = screen.getByRole("group", { name: "Quantity of Baseball Ball" })
    await user.click(within(ballQuantity).getByRole("button", { name: "Remove Baseball Ball" }))

    await waitFor(() => expect(within(list).getAllByRole("listitem")).toHaveLength(1))
    expect(puts.at(-1)?.products).toEqual([{ id: 162, quantity: 2 }])
    expect(list).toHaveFocus()
  })

  it("holds checkout while a change is on its way", async () => {
    const puts = serveCart()
    server.use(
      http.put(CART_URL, async ({ request }) => {
        puts.push((await request.json()) as (typeof puts)[number])
        await delay("infinite")
      })
    )
    const user = userEvent.setup()
    await renderCart()

    const frockQuantity = screen.getByRole("group", { name: "Quantity of Blue Frock" })
    await user.click(within(frockQuantity).getByRole("button", { name: "Increase quantity" }))

    const checkout = within(summary()).getByRole("button", { name: "Proceed to checkout" })
    await waitFor(() => expect(checkout).toHaveAttribute("aria-disabled", "true"))
  })

  it("moves the focus to the empty state when the last line goes", async () => {
    serveCart([frock])
    const user = userEvent.setup()
    await renderCart()

    await user.click(screen.getByRole("button", { name: "Remove Blue Frock" }))

    expect(await screen.findByRole("button", { name: "Browse products" })).toHaveFocus()
  })

  it("shows the empty state once the last line is gone", async () => {
    serveCart([frock])
    const user = userEvent.setup()
    await renderCart()

    await user.click(screen.getByRole("button", { name: "Remove Blue Frock" }))

    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Browse products" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Browse products" })).not.toBeInTheDocument()
  })

  it("turns an unknown coupon down and keeps the focus on the field", async () => {
    serveCart()
    const user = userEvent.setup()
    await renderCart()

    const field = screen.getByLabelText("Coupon code")
    await user.click(screen.getByRole("button", { name: "Apply" }))
    expect(await screen.findByText("Enter a coupon code")).toBeInTheDocument()

    await user.type(field, "NOPE{Enter}")

    expect(await screen.findByText("This coupon isn't valid")).toBeInTheDocument()
    expect(field).toHaveFocus()
    expect(field).toHaveAccessibleDescription("This coupon isn't valid")
  })

  it("applies a coupon, then removes it", async () => {
    serveCart()
    const user = userEvent.setup()
    await renderCart()

    await user.type(screen.getByLabelText("Coupon code"), "welcome10{Enter}")

    const remove = await screen.findByRole("button", { name: "Remove coupon WELCOME10" })
    expect(remove).toHaveFocus()
    expect(within(summary()).getByText("Coupon WELCOME10")).toBeInTheDocument()
    expect(total()).toHaveTextContent("$62.07")

    await user.click(remove)

    expect(await screen.findByLabelText("Coupon code")).toHaveFocus()
    expect(total()).toHaveTextContent("$68.97")
  })

  it("keeps the coupon when a quantity changes", async () => {
    serveCart()
    const user = userEvent.setup()
    await renderCart()

    await user.type(screen.getByLabelText("Coupon code"), "WELCOME10{Enter}")
    await screen.findByRole("button", { name: "Remove coupon WELCOME10" })
    const frockQuantity = screen.getByRole("group", { name: "Quantity of Blue Frock" })
    await user.click(within(frockQuantity).getByRole("button", { name: "Increase quantity" }))

    // 98.96 less 10%, rounded to a cent.
    await waitFor(() => expect(total()).toHaveTextContent("$89.06"))
  })

  it("opens the whole summary from the bar at the bottom", async () => {
    serveCart()
    const user = userEvent.setup()
    await renderCart()

    await user.click(screen.getByRole("button", { name: "Show order summary" }))

    const drawer = await screen.findByRole("dialog", { name: "Order summary" })
    expect(within(drawer).getByLabelText("Coupon code")).toBeInTheDocument()
    expect(within(drawer).getByText("Total").nextElementSibling).toHaveTextContent("$68.97")
  })

  it("offers a retry when the cart does not load", async () => {
    server.use(http.get(CART_URL, () => HttpResponse.json({}, { status: 500 })))
    renderWithProviders(<Cart />, { route: CART_PAGE })

    expect(await screen.findByText("Could not load your cart")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument()
  })
})
