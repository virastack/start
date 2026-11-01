import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it, vi } from "vitest"

import { UsersDirectory } from "@/features/users/components/UsersDirectory"
import { SEARCH_DEBOUNCE_MS } from "@/features/users/constants/users.constants"
import { usersRouteSearch } from "@/features/users/schemas/users-params.schema"
import { renderWithProviders } from "@/test/render"
import type { UrlUpdateEvent } from "@/test/render"
import { server } from "@/test/server"

const USERS_URL = "https://dummyjson.com/users"

function userNamed(id: number, firstName: string) {
  return {
    id,
    firstName,
    lastName: "Test",
    username: firstName.toLowerCase(),
    email: `${firstName.toLowerCase()}@example.com`
  }
}

function pageOf(firstName: string, total = 25) {
  return { users: [userNamed(1, firstName)], total, skip: 0, limit: 10 }
}

function renderDirectory(searchParams = "", onUrlUpdate?: (event: UrlUpdateEvent) => void) {
  return renderWithProviders(<UsersDirectory />, {
    route: { path: "/{-$lang}/users", ...usersRouteSearch },
    initialPath: "/users",
    searchParams,
    onUrlUpdate
  })
}

describe("UsersDirectory", () => {
  it("shows a loading state, then the users", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json(pageOf("Ada"))))
    renderDirectory()

    expect(await screen.findByRole("status", { name: "Loading users" })).toBeInTheDocument()

    expect(await screen.findByText("Ada Test")).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled()
  })

  it("opens the view stored in the URL", async () => {
    server.use(
      http.get(`${USERS_URL}/search`, ({ request }) => {
        const params = new URL(request.url).searchParams
        const matches = params.get("q") === "ada" && params.get("skip") === "10"
        return HttpResponse.json(pageOf(matches ? "Ada" : "Wrong"))
      })
    )
    renderDirectory("?page=2&q=ada")

    expect(await screen.findByText("Ada Test")).toBeInTheDocument()
    expect(screen.getByLabelText("Search users")).toHaveValue("ada")
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument()
  })

  it("reads a search that the router parses as a number", async () => {
    server.use(
      http.get(`${USERS_URL}/search`, ({ request }) => {
        const matches = new URL(request.url).searchParams.get("q") === "123"
        return HttpResponse.json(pageOf(matches ? "Ada" : "Wrong"))
      })
    )
    renderDirectory("?q=123")

    expect(await screen.findByText("Ada Test")).toBeInTheDocument()
    expect(screen.getByLabelText("Search users")).toHaveValue("123")
  })

  it("falls back to the first page when the URL page is invalid", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json(pageOf("Ada"))))
    renderDirectory("?page=-2")

    expect(await screen.findByText("Page 1 of 3")).toBeInTheDocument()
  })

  it("stores the next page in the URL", async () => {
    server.use(
      http.get(USERS_URL, ({ request }) => {
        const skip = new URL(request.url).searchParams.get("skip")
        return HttpResponse.json(pageOf(skip === "10" ? "Grace" : "Ada"))
      })
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderDirectory("", onUrlUpdate)

    await screen.findByText("Ada Test")
    await user.click(screen.getByRole("button", { name: "Next" }))

    expect(await screen.findByText("Grace Test")).toBeInTheDocument()
    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe("?page=2")
  })

  it("follows the URL when the browser goes back", async () => {
    server.use(
      http.get(USERS_URL, ({ request }) => {
        const skip = new URL(request.url).searchParams.get("skip")
        return HttpResponse.json(pageOf(skip === "10" ? "Grace" : "Ada"))
      })
    )
    const user = userEvent.setup()
    const { history } = renderDirectory()

    await screen.findByText("Ada Test")
    await user.click(screen.getByRole("button", { name: "Next" }))
    await screen.findByText("Grace Test")
    history.back()

    expect(await screen.findByText("Ada Test")).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument()
  })

  it("waits for a pause in typing before it sends a search", async () => {
    const searches: Array<string | null> = []
    server.use(
      http.get(USERS_URL, () => HttpResponse.json(pageOf("Ada"))),
      http.get(`${USERS_URL}/search`, ({ request }) => {
        searches.push(new URL(request.url).searchParams.get("q"))
        return HttpResponse.json(pageOf("Grace", 1))
      })
    )
    const user = userEvent.setup()
    renderDirectory()

    await screen.findByText("Ada Test")
    await user.type(screen.getByLabelText("Search users"), "grace")

    expect(screen.getByLabelText("Search users")).toHaveValue("grace")
    expect(await screen.findByText("Grace Test")).toBeInTheDocument()
    expect(searches).toEqual(["grace"])
  })

  it("drops a pending search when the page closes", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json(pageOf("Ada"))))
    const user = userEvent.setup()
    const { history, unmount } = renderDirectory()

    await screen.findByText("Ada Test")
    await user.type(screen.getByLabelText("Search users"), "g")
    unmount()
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50))

    expect(history.location.search).toBe("")
  })

  it("goes back to the first page when the search changes", async () => {
    server.use(
      http.get(USERS_URL, () => HttpResponse.json(pageOf("Ada"))),
      http.get(`${USERS_URL}/search`, ({ request }) => {
        const params = new URL(request.url).searchParams
        const matches = params.get("q") === "gr" && params.get("skip") === "0"
        return HttpResponse.json(pageOf(matches ? "Grace" : "Wrong", 1))
      })
    )
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const user = userEvent.setup()
    renderDirectory("?page=2", onUrlUpdate)

    await screen.findByText("Ada Test")
    await user.type(screen.getByLabelText("Search users"), "gr")

    expect(await screen.findByText("Grace Test")).toBeInTheDocument()
    await waitFor(() => expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe("?q=gr"))
  })

  it("shows an empty state that can clear the search", async () => {
    server.use(
      http.get(`${USERS_URL}/search`, () =>
        HttpResponse.json({ users: [], total: 0, skip: 0, limit: 0 })
      ),
      http.get(USERS_URL, () => HttpResponse.json(pageOf("Ada")))
    )
    const user = userEvent.setup()
    renderDirectory("?q=nobody")

    expect(await screen.findByText("No users found")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Clear search" }))

    expect(await screen.findByText("Ada Test")).toBeInTheDocument()
    expect(screen.getByLabelText("Search users")).toHaveValue("")
  })

  it("offers the first page when the URL points past the last one", async () => {
    server.use(
      http.get(USERS_URL, ({ request }) => {
        const skip = new URL(request.url).searchParams.get("skip")
        return HttpResponse.json(
          skip === "0" ? pageOf("Ada") : { users: [], total: 25, skip: 90, limit: 10 }
        )
      })
    )
    const user = userEvent.setup()
    renderDirectory("?page=10")

    expect(await screen.findByText("This page is empty")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Go to the first page" }))

    expect(await screen.findByText("Ada Test")).toBeInTheDocument()
  })

  it("shows an error state and recovers with retry", async () => {
    let requests = 0
    server.use(
      http.get(USERS_URL, () => {
        requests += 1
        return requests === 1
          ? HttpResponse.json({}, { status: 503 })
          : HttpResponse.json(pageOf("Ada"))
      })
    )
    const user = userEvent.setup()
    renderDirectory()

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load users")
    await user.click(screen.getByRole("button", { name: "Retry" }))

    expect(await screen.findByText("Ada Test")).toBeInTheDocument()
  })
})
