import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UserEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { LoginForm } from "@/features/auth/components/LoginForm"
import { LOGIN_PATH } from "@/features/auth/constants/auth.constants"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

const LOGIN_URL = `${siteConfig.apiUrl}${LOGIN_PATH}`
// `LoginForm` has links, so it renders inside a route.
const LOGIN_PAGE = { path: "/login" }

const emily = {
  id: 1,
  username: "emilys",
  email: "emily.johnson@x.dummyjson.com",
  firstName: "Emily",
  lastName: "Johnson",
  image: "https://dummyjson.com/icon/emilys/128",
  accessToken: "access-token-xyzzy",
  refreshToken: "refresh-token-plugh"
}

/** DummyJSON's sign-in: its first user's credentials work, anything else answers 400. */
function serveLogin() {
  const bodies: unknown[] = []
  server.use(
    http.post(LOGIN_URL, async ({ request }) => {
      const body = (await request.json()) as { username: string; password: string }
      bodies.push(body)
      return body.username === "emilys" && body.password === "emilyspass"
        ? HttpResponse.json(emily)
        : HttpResponse.json({ message: "Invalid credentials" }, { status: 400 })
    })
  )
  return bodies
}

async function renderLogin() {
  renderWithProviders(<LoginForm />, { route: LOGIN_PAGE })
  return screen.findByLabelText("Username")
}

async function signIn(user: UserEvent, username: string, password: string) {
  await user.type(await renderLogin(), username)
  await user.type(screen.getByLabelText("Password"), password)
  await user.click(screen.getByRole("button", { name: "Sign in" }))
}

describe("LoginForm", () => {
  it("sends nothing while a field is empty", async () => {
    const bodies = serveLogin()
    const user = userEvent.setup()
    await renderLogin()

    await user.click(screen.getByRole("button", { name: "Sign in" }))

    expect(await screen.findByText("Enter your username")).toBeInTheDocument()
    expect(screen.getByText("Enter your password")).toBeInTheDocument()
    expect(screen.getByLabelText("Username")).toHaveAttribute("aria-invalid", "true")
    expect(bodies).toHaveLength(0)
  })

  it("is a post form whose password field a password manager recognizes", async () => {
    await renderLogin()

    const password = screen.getByLabelText("Password")
    expect(password).toHaveAttribute("type", "password")
    expect(password).toHaveAttribute("autocomplete", "current-password")
    expect(password.closest("form")).toHaveAttribute("method", "post")
  })

  it("shows and hides the password", async () => {
    const user = userEvent.setup()
    await renderLogin()
    const password = screen.getByLabelText("Password")
    const toggle = screen.getByRole("button", { name: "Show password" })

    await user.click(toggle)
    expect(password).toHaveAttribute("type", "text")
    expect(toggle).toHaveAttribute("aria-pressed", "true")

    await user.click(toggle)
    expect(password).toHaveAttribute("type", "password")
  })

  it("says the credentials are wrong and clears the password", async () => {
    serveLogin()
    const user = userEvent.setup()

    await signIn(user, "emilys", "wrong-password-quux")

    expect(await screen.findByRole("alert")).toHaveTextContent("Wrong username or password")
    expect(screen.getByLabelText("Username")).toHaveValue("emilys")
    expect(screen.getByLabelText("Password")).toHaveValue("")
    expect(screen.getByLabelText("Password")).toHaveFocus()
  })

  it("says so when the request fails for another reason", async () => {
    server.use(http.post(LOGIN_URL, () => HttpResponse.json({}, { status: 500 })))
    const user = userEvent.setup()

    await signIn(user, "emilys", "emilyspass")

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not sign in")
  })

  it("fills in the demo account, signs in and shows who is signed in, without the tokens", async () => {
    const bodies = serveLogin()
    const user = userEvent.setup()
    await renderLogin()

    await user.click(screen.getByRole("button", { name: "Use demo account" }))
    await user.click(screen.getByRole("button", { name: "Sign in" }))

    const status = await screen.findByRole("status")
    expect(status).toHaveTextContent("Emily Johnson")
    expect(status).toHaveTextContent("@emilys")
    expect(bodies).toEqual([{ username: "emilys", password: "emilyspass" }])
    expect(document.body.innerHTML).not.toMatch(/xyzzy|plugh|emilyspass/)
  })

  it("signs out back to the form", async () => {
    serveLogin()
    const user = userEvent.setup()

    await signIn(user, "emilys", "emilyspass")
    await user.click(await screen.findByRole("button", { name: "Sign out" }))

    expect(await screen.findByLabelText("Username")).toHaveValue("")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("links to the sign-up page", async () => {
    await renderLogin()

    const prompt = screen.getByText(/No account yet/)
    expect(within(prompt).getByRole("link", { name: "Create one" })).toHaveAttribute(
      "href",
      "/register"
    )
  })
})
