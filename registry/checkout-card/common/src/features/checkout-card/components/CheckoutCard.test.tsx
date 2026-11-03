import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UserEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw/http"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { siteConfig } from "@/config/site.config"

import { getCards } from "@/features/checkout-payment/api/get-cards.api"
import { CheckoutPayment } from "@/features/checkout-payment/components/CheckoutPayment"
import { CARDS_PATH } from "@/features/checkout-payment/constants/cards.constants"
import { useCardSelectionStore } from "@/features/checkout-payment/stores/card-selection.store"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

vi.mock("@/features/checkout-payment/api/get-cards.api", { spy: true })

const ADD_URL = `${siteConfig.apiUrl}${CARDS_PATH}/add`

async function renderPayment() {
  renderWithProviders(<CheckoutPayment />)
  return screen.findByRole("region", { name: "Payment method" })
}

async function openPicker(user: UserEvent) {
  await user.click(screen.getByRole("button", { name: "Change payment method" }))
  return screen.findByRole("dialog")
}

async function openForm(user: UserEvent) {
  const dialog = await openPicker(user)
  await user.click(within(dialog).getByRole("button", { name: "Add new card" }))
}

async function fillCard(user: UserEvent, number: string, expiry: string, cvv: string) {
  await user.type(await screen.findByLabelText("Card number"), number)
  await user.type(screen.getByLabelText("Name on card"), "Ömer Gülçiçek")
  await user.type(screen.getByLabelText("Expiry (MM/YY)"), expiry)
  await user.type(screen.getByLabelText("CVV"), cvv)
}

describe("CheckoutPayment", () => {
  beforeEach(() => {
    useCardSelectionStore.setState({ selectedId: null })
  })

  it("opens straight on the form when there is no card yet", async () => {
    vi.mocked(getCards).mockResolvedValueOnce([])
    const user = userEvent.setup()
    await renderPayment()

    await user.click(screen.getByRole("button", { name: "Add card" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByLabelText("Card number")).toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: "Back to cards" })).toBeNull()
  })

  it("shows only the chosen card", async () => {
    const payment = await renderPayment()

    expect(within(payment).getByText(/Garanti BBVA/)).toBeInTheDocument()
    expect(within(payment).getByText(/0003/)).toBeInTheDocument()
    expect(screen.queryByText(/Akbank/)).not.toBeInTheDocument()
  })

  it("lists saved cards without an edit button and changes the card", async () => {
    const user = userEvent.setup()
    const payment = await renderPayment()

    const dialog = await openPicker(user)
    expect(within(dialog).getAllByRole("radio")).toHaveLength(3)
    expect(within(dialog).queryByRole("button", { name: /Edit/ })).not.toBeInTheDocument()

    await user.click(within(dialog).getByRole("radio", { name: /Akbank/ }))
    await user.click(within(dialog).getByRole("button", { name: "Use this card" }))

    expect(await within(payment).findByText(/Akbank/)).toBeInTheDocument()
    expect(useCardSelectionStore.getState().selectedId).toBe(2)
  })

  it("sends nothing while the fields are empty", async () => {
    let requests = 0
    server.use(
      http.post(ADD_URL, () => {
        requests += 1
        return HttpResponse.json({ id: 209 })
      })
    )
    const user = userEvent.setup()
    await renderPayment()

    await openForm(user)
    await user.click(await screen.findByRole("button", { name: "Save card" }))

    expect(await screen.findByText("Enter the card number")).toBeInTheDocument()
    expect(screen.getByText("Enter the name on the card")).toBeInTheDocument()
    expect(screen.getByText("Enter the expiry date")).toBeInTheDocument()
    expect(screen.getByText("Enter the CVV")).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it("rejects a number that fails the Luhn check and a past expiry", async () => {
    const user = userEvent.setup()
    await renderPayment()

    await openForm(user)
    await fillCard(user, "5400360000000004", "0120", "123")
    await user.click(screen.getByRole("button", { name: "Save card" }))

    expect(await screen.findByText("Check the card number")).toBeInTheDocument()
    expect(screen.getByText("Enter a valid future date")).toBeInTheDocument()
  })

  it("formats the fields and lets an Amex CVV have four digits", async () => {
    const user = userEvent.setup()
    await renderPayment()

    await openForm(user)
    await fillCard(user, "374427000000003", "1230", "1234")

    expect(screen.getByLabelText("Card number")).toHaveValue("3744 270000 00003")
    expect(screen.getByLabelText("Expiry (MM/YY)")).toHaveValue("12/30")
    expect(screen.getByLabelText("CVV")).toHaveValue("1234")
  })

  it("posts no card number or CVV, then shows the new card as chosen", async () => {
    let body = ""
    server.use(
      http.post(ADD_URL, async ({ request }) => {
        body = await request.text()
        return HttpResponse.json({ id: 209 }, { status: 201 })
      })
    )
    const user = userEvent.setup()
    const payment = await renderPayment()

    await openForm(user)
    await fillCard(user, "4543590000000006", "1230", "321")
    expect(screen.getByLabelText("Card number")).toHaveAttribute("autocomplete", "cc-number")
    await user.click(screen.getByRole("button", { name: "Save card" }))

    expect(await within(payment).findByText(/Visa/)).toBeInTheDocument()
    expect(within(payment).getByText(/0006/)).toBeInTheDocument()
    expect(body).toContain("tok_dummy_")
    expect(body).not.toContain("4543590000000006")
    expect(body).not.toContain("321")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("keeps the input and shows an error when saving fails", async () => {
    server.use(http.post(ADD_URL, () => HttpResponse.json({}, { status: 500 })))
    const user = userEvent.setup()
    await renderPayment()

    await openForm(user)
    await fillCard(user, "5400360000000003", "1230", "123")
    await user.click(screen.getByRole("button", { name: "Save card" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/Could not save/)
    expect(screen.getByLabelText("Name on card")).toHaveValue("Ömer Gülçiçek")
  })
})
