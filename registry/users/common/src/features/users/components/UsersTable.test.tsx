import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UserEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { UsersTable } from "@/features/users/components/UsersTable"
import { USERS_PATH } from "@/features/users/constants/users.constants"
import { useUsers } from "@/features/users/hooks/use-users"
import type { UsersPage } from "@/features/users/schemas/user.schema"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

const USER_URL = `${siteConfig.apiUrl}${USERS_PATH}/1`
const FILTERS = { page: 1, q: "" }
const ADA = {
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  username: "ada.lovelace",
  role: "admin" as const,
  company: { title: "Mathematician", department: "Research" }
}
const PAGE: UsersPage = { users: [ADA], total: 1, skip: 0, limit: 10 }

function Table() {
  const { data } = useUsers(FILTERS)

  return data ? (
    <>
      <UsersTable users={data.users} />
      <p>Total: {data.total}</p>
    </>
  ) : null
}

async function renderTable() {
  server.use(http.get(`${siteConfig.apiUrl}${USERS_PATH}`, () => HttpResponse.json(PAGE)))
  renderWithProviders(<Table />)
  await screen.findByRole("table")
}

async function choose(user: UserEvent, item: string) {
  await user.click(screen.getByRole("button", { name: "Open actions for Ada Lovelace" }))
  await user.click(await screen.findByRole("menuitem", { name: item }))
}

describe("UsersTable actions", () => {
  it("shows the row's data in the details dialog", async () => {
    const user = userEvent.setup()
    await renderTable()

    await choose(user, "View details")

    const dialog = await screen.findByRole("dialog")
    expect(within(dialog).getByText("@ada.lovelace")).toBeInTheDocument()
    expect(within(dialog).getByText("Mathematician")).toBeInTheDocument()
    expect(within(dialog).getByText("Research")).toBeInTheDocument()
  })

  it("edits with the row's data and updates the row", async () => {
    let body: unknown
    server.use(
      http.put(USER_URL, async ({ request }) => {
        body = await request.clone().json()
        return HttpResponse.json({ ...Object(body), id: 1 })
      })
    )
    const user = userEvent.setup()
    await renderTable()

    await choose(user, "Edit")
    const dialog = await screen.findByRole("dialog")
    const title = within(dialog).getByLabelText("Position")
    expect(title).toHaveValue("Mathematician")
    await user.clear(title)
    await user.type(title, "Analyst")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(body).toMatchObject({ company: { title: "Analyst", department: "Research" } })
    expect(screen.getByRole("table")).toHaveTextContent("Analyst")
  })

  it("keeps the dialog open and shows the error when saving fails", async () => {
    server.use(http.put(USER_URL, () => HttpResponse.json({}, { status: 500 })))
    const user = userEvent.setup()
    await renderTable()

    await choose(user, "Edit")
    const dialog = await screen.findByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }))

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(/could not save/i)
  })

  it("sends nothing when the delete is cancelled", async () => {
    let requests = 0
    server.use(
      http.delete(USER_URL, () => {
        requests += 1
        return HttpResponse.json({ id: 1 })
      })
    )
    const user = userEvent.setup()
    await renderTable()

    await choose(user, "Delete")
    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }))

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    expect(requests).toBe(0)
    expect(screen.getByRole("table")).toHaveTextContent("Ada Lovelace")
  })

  it("removes the row and lowers the total after a delete", async () => {
    server.use(http.delete(USER_URL, () => HttpResponse.json({ id: 1 })))
    const user = userEvent.setup()
    await renderTable()

    await choose(user, "Delete")
    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Delete" }))

    await waitFor(() => expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument())
    expect(screen.getByText("Total: 0")).toBeInTheDocument()
  })
})
