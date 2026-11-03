import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UserEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw/http"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { siteConfig } from "@/config/site.config"

import { getAddresses } from "@/features/checkout-address/api/get-addresses.api"
import { CheckoutAddress } from "@/features/checkout-address/components/CheckoutAddress"
import { ADDRESSES_PATH } from "@/features/checkout-address/constants/addresses.constants"
import { useAddressSelectionStore } from "@/features/checkout-address/stores/address-selection.store"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

vi.mock("@/features/checkout-address/api/get-addresses.api", { spy: true })

const ADD_URL = `${siteConfig.apiUrl}${ADDRESSES_PATH}/add`
const EDIT_URL = `${siteConfig.apiUrl}${ADDRESSES_PATH}/1`

async function renderAddresses() {
  renderWithProviders(<CheckoutAddress />)
  return screen.findByRole("region", { name: "Shipping address" })
}

async function openPicker(user: UserEvent) {
  await user.click(screen.getByRole("button", { name: "Change Shipping address" }))
  return screen.findByRole("dialog")
}

async function openNewForm(user: UserEvent) {
  const dialog = await openPicker(user)
  await user.click(within(dialog).getByRole("button", { name: "Add new address" }))
}

async function pick(user: UserEvent, label: string, option: string) {
  await user.click(screen.getByRole("combobox", { name: label }))
  await user.click(await screen.findByRole("option", { name: option }))
}

describe("CheckoutAddress", () => {
  beforeEach(() => {
    useAddressSelectionStore.setState({
      shippingId: null,
      billingId: null,
      isBillingSameAsShipping: true
    })
  })

  it("asks for the corporate details only on a corporate address", async () => {
    const user = userEvent.setup()
    await renderAddresses()
    await openNewForm(user)

    expect(screen.queryByLabelText("Company name")).not.toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Corporate" }))
    await user.click(screen.getByRole("button", { name: "Save address" }))

    expect(await screen.findByText("Enter the company name")).toBeInTheDocument()
    expect(screen.getByLabelText("Company name")).toHaveAccessibleDescription(
      "Enter the company name"
    )
    expect(screen.getByRole("combobox", { name: "Province" })).toHaveAccessibleDescription(
      "Select a province"
    )
    expect(screen.getByText("Enter the tax number")).toBeInTheDocument()
    expect(screen.getByText("Enter the tax office")).toBeInTheDocument()

    const taxNumber = screen.getByLabelText("Tax number (VKN)")
    await user.type(taxNumber, "12ab345")
    expect(taxNumber).toHaveValue("12345")
    expect(await screen.findByText("Check the tax number")).toBeInTheDocument()

    await user.click(screen.getByRole("radio", { name: "Individual" }))
    expect(screen.queryByLabelText("Company name")).not.toBeInTheDocument()
    expect(screen.queryByText("Check the tax number")).not.toBeInTheDocument()
  })

  it("opens straight on the form when there is no address yet", async () => {
    vi.mocked(getAddresses).mockResolvedValueOnce([])
    const user = userEvent.setup()
    await renderAddresses()

    await user.click(screen.getByRole("button", { name: "Add Shipping address" }))

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByLabelText("First name")).toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: "Back to addresses" })).toBeNull()
  })

  it("focuses the first field on an empty submit", async () => {
    const user = userEvent.setup()
    await renderAddresses()
    await openNewForm(user)

    await user.click(screen.getByRole("button", { name: "Save address" }))

    expect(await screen.findByLabelText("First name")).toHaveFocus()
  })

  it("focuses the address line before the province when both are empty", async () => {
    const user = userEvent.setup()
    await renderAddresses()
    await openNewForm(user)
    await user.type(screen.getByLabelText("First name"), "Ömer")
    await user.type(screen.getByLabelText("Last name"), "Gülçiçek")
    await user.type(screen.getByLabelText("Mobile phone for delivery"), "5550000000")

    await user.click(screen.getByRole("button", { name: "Save address" }))

    expect(await screen.findByLabelText("Address line")).toHaveFocus()
  })

  it("shows only the chosen address, and only one while billing matches shipping", async () => {
    const shipping = await renderAddresses()

    expect(within(shipping).getByText("Home")).toBeInTheDocument()
    expect(within(shipping).getByText(/Caferağa Mah\. 34710 Kadıköy\/İstanbul/)).toBeInTheDocument()
    expect(screen.queryByText("Work")).not.toBeInTheDocument()
    expect(screen.queryByRole("region", { name: "Billing address" })).not.toBeInTheDocument()
  })

  it("shows a billing address next to shipping when billing differs", async () => {
    const user = userEvent.setup()
    await renderAddresses()

    await user.click(screen.getByRole("checkbox", { name: /shipping address for billing/ }))

    const billing = screen.getByRole("region", { name: "Billing address" })
    expect(within(billing).getByText("Home")).toBeInTheDocument()
    expect(within(billing).getByRole("button", { name: "Change Billing address" })).toBeEnabled()
  })

  it("changes the address from the picker", async () => {
    const user = userEvent.setup()
    const shipping = await renderAddresses()

    const dialog = await openPicker(user)
    expect(within(dialog).getAllByRole("radio")).toHaveLength(2)
    expect(within(dialog).getByRole("radio", { name: /Home/ })).toBeChecked()
    await user.click(within(dialog).getByRole("radio", { name: /Work/ }))
    await user.click(within(dialog).getByRole("button", { name: "Use this address" }))

    expect(await within(shipping).findByText("Work")).toBeInTheDocument()
    expect(useAddressSelectionStore.getState().shippingId).toBe(2)
  })

  it("shows no errors below a province before the first submit", async () => {
    const user = userEvent.setup()
    await renderAddresses()

    await openNewForm(user)
    await pick(user, "Province", "Ankara")

    expect(screen.getByRole("combobox", { name: "District" })).toHaveAttribute(
      "aria-invalid",
      "false"
    )
    expect(screen.getByRole("combobox", { name: "Neighbourhood" })).toHaveAttribute(
      "aria-invalid",
      "false"
    )
    expect(screen.queryByText("Enter the postal code")).not.toBeInTheDocument()
  })

  it("sends nothing while the new address is invalid", async () => {
    let requests = 0
    server.use(
      http.post(ADD_URL, () => {
        requests += 1
        return HttpResponse.json({ id: 209 })
      })
    )
    const user = userEvent.setup()
    await renderAddresses()

    await openNewForm(user)
    await user.click(await screen.findByRole("button", { name: "Save address" }))

    expect(await screen.findByText("Enter a first name")).toBeInTheDocument()
    expect(screen.getByText("Enter a last name")).toBeInTheDocument()
    expect(screen.getByText("Enter a mobile phone number")).toBeInTheDocument()
    expect(screen.getByText("Enter the address line")).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it("marks autofill fields, with the address title left out", async () => {
    const user = userEvent.setup()
    await renderAddresses()

    await openNewForm(user)

    expect(screen.getByLabelText("First name")).toHaveAttribute(
      "autocomplete",
      "shipping given-name"
    )
    expect(screen.getByLabelText("Last name")).toHaveAttribute(
      "autocomplete",
      "shipping family-name"
    )
    expect(screen.getByLabelText("Address line")).toHaveAttribute(
      "autocomplete",
      "shipping street-address"
    )
    expect(screen.getByLabelText("Address title")).toHaveAttribute("autocomplete", "off")
  })

  it("posts a new address, then shows it as the chosen one", async () => {
    let body: Record<string, unknown> = {}
    server.use(
      http.post(ADD_URL, async ({ request }) => {
        body = Object(await request.json())
        return HttpResponse.json({ id: 209 }, { status: 201 })
      })
    )
    const user = userEvent.setup()
    const shipping = await renderAddresses()

    await openNewForm(user)
    await user.type(await screen.findByLabelText("First name"), "Grace")
    await user.type(screen.getByLabelText("Last name"), "Hopper")
    await user.type(screen.getByLabelText("Mobile phone for delivery"), "5550000002")
    await user.type(screen.getByLabelText("Address line"), "Örnek Sokak")
    await pick(user, "Province", "İstanbul")
    await pick(user, "District", "Kadıköy")
    await pick(user, "Neighbourhood", "Caferağa Mah.")
    await user.type(screen.getByLabelText("Address title"), "Summer house")
    await user.click(screen.getByRole("button", { name: "Save address" }))

    expect(await within(shipping).findByText("Summer house")).toBeInTheDocument()
    expect(body).toMatchObject({
      firstName: "Grace",
      lastName: "Hopper",
      phone: "5550000002",
      addressName: "Summer house",
      provinceCode: "34",
      province: "İSTANBUL",
      postalCode: "34710",
      countryCode: "TR",
      isDefault: false
    })
    expect(body).not.toHaveProperty("type")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("opens the form filled and puts the edit", async () => {
    let requests = 0
    server.use(
      http.put(EDIT_URL, () => {
        requests += 1
        return HttpResponse.json({ id: 1 })
      })
    )
    const user = userEvent.setup()
    const shipping = await renderAddresses()

    const dialog = await openPicker(user)
    await user.click(within(dialog).getByRole("button", { name: "Edit Home" }))

    expect(await screen.findByLabelText("Address title")).toHaveValue("Home")
    expect(screen.getByLabelText("First name")).toHaveValue("Ömer")
    expect(screen.getByLabelText("Mobile phone for delivery")).toHaveValue("(555) 000 00 00")
    expect(screen.getByRole("combobox", { name: "Province" })).toHaveTextContent("İstanbul")

    await user.clear(screen.getByLabelText("Address title"))
    await user.type(screen.getByLabelText("Address title"), "Flat")
    await user.click(screen.getByRole("button", { name: "Save address" }))
    await user.click(await screen.findByRole("button", { name: "Use this address" }))

    expect(await within(shipping).findByText("Flat")).toBeInTheDocument()
    expect(requests).toBe(1)
  })

  it("keeps the input and shows an error when saving fails", async () => {
    server.use(http.put(EDIT_URL, () => HttpResponse.json({}, { status: 500 })))
    const user = userEvent.setup()
    await renderAddresses()

    const dialog = await openPicker(user)
    await user.click(within(dialog).getByRole("button", { name: "Edit Home" }))
    await user.click(await screen.findByRole("button", { name: "Save address" }))

    expect(await screen.findByRole("alert")).toHaveTextContent(/Could not save/)
    expect(screen.getByLabelText("Address title")).toHaveValue("Home")
  })
})
