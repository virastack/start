import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { UserEvent } from "@testing-library/user-event"
import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { AddUserForm } from "@/features/users/components/AddUserForm"
import { USERS_PATH } from "@/features/users/constants/users.constants"
import { renderWithProviders } from "@/test/render"
import { server } from "@/test/server"

const ADD_USER_URL = `${siteConfig.apiUrl}${USERS_PATH}/add`

async function fillAndSubmit(user: UserEvent) {
  await user.type(screen.getByLabelText("First name"), "Ada")
  await user.type(screen.getByLabelText("Last name"), "Lovelace")
  await user.type(screen.getByLabelText("Username"), "ada.lovelace")
  await user.type(screen.getByLabelText("Position"), "Mathematician")
  await user.type(screen.getByLabelText("Department"), "Research")
  await user.click(screen.getByRole("button", { name: "Add user" }))
}

describe("AddUserForm", () => {
  it("shows validation errors and sends nothing while the input is invalid", async () => {
    let requests = 0
    server.use(
      http.post(ADD_USER_URL, () => {
        requests += 1
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<AddUserForm />)

    await user.type(screen.getByLabelText("Username"), "not valid")
    await user.click(screen.getByRole("button", { name: "Add user" }))

    expect(await screen.findByText("Enter a first name")).toBeInTheDocument()
    expect(screen.getByText("Enter a last name")).toBeInTheDocument()
    expect(screen.getByText("Enter a position")).toBeInTheDocument()
    expect(screen.getByText("Enter a department")).toBeInTheDocument()
    expect(screen.getByText(/Use letters, numbers/)).toBeInTheDocument()
    expect(screen.getByLabelText("Username")).toHaveAttribute("aria-invalid", "true")
    expect(requests).toBe(0)
  })

  it("shows the returned user and says the demo API does not save it", async () => {
    server.use(
      http.post(ADD_USER_URL, async ({ request }) => {
        const body = await request.clone().json()
        return HttpResponse.json({ ...Object(body), id: 209 }, { status: 201 })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<AddUserForm />)

    await fillAndSubmit(user)

    const result = await screen.findByRole("status")
    expect(result).toHaveTextContent("user #209")
    expect(result).toHaveTextContent("Ada Lovelace")
    expect(result).toHaveTextContent("@ada.lovelace")
    expect(result).toHaveTextContent(/not saved/i)
    expect(result).toHaveTextContent(/does not store it/i)
  })

  it("sends the position and department under company", async () => {
    let body: unknown
    server.use(
      http.post(ADD_USER_URL, async ({ request }) => {
        body = await request.clone().json()
        return HttpResponse.json({ ...Object(body), id: 209 })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<AddUserForm />)

    await fillAndSubmit(user)
    await screen.findByRole("status")

    expect(body).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada.lovelace",
      role: "user",
      company: { title: "Mathematician", department: "Research" }
    })
  })

  it("returns to an empty form for another user", async () => {
    server.use(
      http.post(ADD_USER_URL, () =>
        HttpResponse.json({
          id: 209,
          firstName: "Ada",
          lastName: "Lovelace",
          username: "ada.lovelace"
        })
      )
    )
    const user = userEvent.setup()
    renderWithProviders(<AddUserForm />)

    await fillAndSubmit(user)
    await user.click(await screen.findByRole("button", { name: "Add another user" }))

    expect(screen.getByLabelText("First name")).toHaveValue("")
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("shows an error and keeps the input when the request fails", async () => {
    server.use(http.post(ADD_USER_URL, () => HttpResponse.json({}, { status: 500 })))
    const user = userEvent.setup()
    renderWithProviders(<AddUserForm />)

    await fillAndSubmit(user)

    expect(await screen.findByRole("alert")).toHaveTextContent(/could not add the user/i)
    expect(screen.getByLabelText("First name")).toHaveValue("Ada")
  })
})
