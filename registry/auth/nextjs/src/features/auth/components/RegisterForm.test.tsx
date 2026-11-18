import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UserEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { REGISTER_PATH } from "@/features/auth/constants/auth.constants"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

const REGISTER_URL = `${siteConfig.apiUrl}${REGISTER_PATH}`
const PASSWORD = "velvet-river-compass-7"

/** DummyJSON's `/users/add`: it echoes what it was sent, the password too, with a new id. */
function serveRegister() {
  const bodies: unknown[] = []
  server.use(
    http.post(REGISTER_URL, async ({ request }) => {
      const body: unknown = await request.json()
      bodies.push(body)
      return HttpResponse.json({ ...Object(body), id: 209 }, { status: 201 })
    })
  )
  return bodies
}

async function renderRegister() {
  renderWithProviders(<RegisterForm />)
  return screen.findByLabelText("First name")
}

async function fillDetails(user: UserEvent) {
  await user.type(screen.getByLabelText("First name"), "Ada")
  await user.type(screen.getByLabelText("Last name"), "Lovelace")
  await user.type(screen.getByLabelText("Username"), "ada.lovelace")
  await user.type(screen.getByLabelText("Email"), "ada@example.com")
}

async function fillAndSubmit(user: UserEvent, password = PASSWORD, confirm = password) {
  await fillDetails(user)
  await user.type(screen.getByLabelText("Password"), password)
  await user.type(screen.getByLabelText("Confirm password"), confirm)
  await user.click(screen.getByRole("button", { name: "Create account" }))
}

describe("RegisterForm", () => {
  it("shows every error and sends nothing while the input is invalid", async () => {
    const bodies = serveRegister()
    const user = userEvent.setup()
    await renderRegister()

    await user.type(screen.getByLabelText("Username"), "not valid")
    await user.type(screen.getByLabelText("Email"), "ada@")
    await user.click(screen.getByRole("button", { name: "Create account" }))

    expect(await screen.findByText("Enter your first name")).toBeInTheDocument()
    expect(screen.getByText("Enter your last name")).toBeInTheDocument()
    expect(screen.getByText(/Use letters, numbers/)).toBeInTheDocument()
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument()
    expect(screen.getByText("Use at least 15 characters")).toBeInTheDocument()
    // The error joins the strength in the field's description; it does not replace it.
    const password = screen.getByLabelText("Password")
    expect(password).toHaveAccessibleDescription(/Use at least 15 characters/)
    expect(password).toHaveAccessibleDescription(/Choose a long password/)
    expect(bodies).toHaveLength(0)
  })

  it("scores the password as it is typed and ticks the rules it meets", async () => {
    const user = userEvent.setup()
    await renderRegister()
    const password = screen.getByLabelText("Password")
    expect(password).toHaveAttribute("autocomplete", "new-password")

    await user.type(password, "short")
    expect(screen.getByText("Strength: Weak")).toHaveAttribute("role", "status")
    expect(screen.getByText("15 to 64 characters")).toHaveTextContent("Not met:")

    await user.clear(password)
    await user.type(password, PASSWORD)
    expect(screen.getByText("Strength: Good")).toBeInTheDocument()
    expect(screen.getByText("15 to 64 characters")).toHaveTextContent("Met:")
    expect(password).toHaveAccessibleDescription(/Strength: Good/)
  })

  it("turns down a common password, one made of the name, and a confirmation that differs", async () => {
    const bodies = serveRegister()
    const user = userEvent.setup()
    await renderRegister()

    await fillAndSubmit(user, "lovelace-lovelace-1815", "lovelace-lovelace-1816")
    expect(await screen.findByText("Don't use your name, username or email")).toBeInTheDocument()
    expect(screen.getByText("The passwords don't match")).toBeInTheDocument()

    await user.clear(screen.getByLabelText("Password"))
    await user.type(screen.getByLabelText("Password"), "password12345678")
    await user.click(screen.getByRole("button", { name: "Create account" }))
    expect(await screen.findByText("This password is too common")).toBeInTheDocument()
    expect(bodies).toHaveLength(0)
  })

  it("shows the returned account, says it was not saved, and keeps the password out of it", async () => {
    const bodies = serveRegister()
    const user = userEvent.setup()
    await renderRegister()

    await fillAndSubmit(user)

    const result = await screen.findByRole("status")
    expect(result).toHaveTextContent("user #209")
    expect(result).toHaveTextContent("Ada Lovelace")
    expect(result).toHaveTextContent("@ada.lovelace")
    expect(result).toHaveTextContent(/not saved/i)
    expect(screen.getByRole("link", { name: "Go to sign in" })).toHaveAttribute("href", "/login")
    expect(bodies).toEqual([
      {
        firstName: "Ada",
        lastName: "Lovelace",
        username: "ada.lovelace",
        email: "ada@example.com",
        password: PASSWORD
      }
    ])
    expect(document.body.innerHTML).not.toContain(PASSWORD)
  })

  it("starts over with an empty form", async () => {
    serveRegister()
    const user = userEvent.setup()
    await renderRegister()

    await fillAndSubmit(user)
    await user.click(await screen.findByRole("button", { name: "Create another account" }))

    expect(screen.getByLabelText("First name")).toHaveValue("")
    expect(screen.getByLabelText("Password")).toHaveValue("")
  })

  it("keeps the input and shows an error when the request fails", async () => {
    server.use(http.post(REGISTER_URL, () => HttpResponse.json({}, { status: 500 })))
    const user = userEvent.setup()
    await renderRegister()

    await fillAndSubmit(user)

    expect(await screen.findByText(/Could not create the account/)).toBeInTheDocument()
    expect(screen.getByLabelText("First name")).toHaveValue("Ada")
  })

  it("links to the sign-in page", async () => {
    await renderRegister()

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login")
  })
})
