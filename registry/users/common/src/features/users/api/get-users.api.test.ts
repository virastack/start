import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { ApiError } from "@/lib/api"

import { getUsers } from "@/features/users/api/get-users.api"
import { USERS_PATH } from "@/features/users/constants/users.constants"
import { server } from "@/test/server"

const USERS_URL = `${siteConfig.apiUrl}${USERS_PATH}`

const ada = {
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  username: "ada",
  email: "ada@example.com",
  role: "admin",
  company: { title: "Mathematician", department: "Research" }
}

function pageOf(users: unknown[], skip = 0) {
  return { users, total: users.length, skip, limit: 10 }
}

describe("getUsers", () => {
  it("turns the page into limit and skip", async () => {
    let params: URLSearchParams | undefined
    server.use(
      http.get(USERS_URL, ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json(pageOf([ada], 20))
      })
    )

    await expect(getUsers({ page: 3, q: "" })).resolves.toEqual(pageOf([ada], 20))
    expect(params?.get("limit")).toBe("10")
    expect(params?.get("skip")).toBe("20")
    expect(params?.has("q")).toBe(false)
    expect(params?.get("sortBy")).toBe("lastName")
    expect(params?.get("order")).toBe("desc")
  })

  it("accepts a user without a company", async () => {
    const { company: _company, ...withoutCompany } = ada
    server.use(http.get(USERS_URL, () => HttpResponse.json(pageOf([withoutCompany]))))

    const { users } = await getUsers({ page: 1, q: "" })

    expect(users[0]?.company).toBeUndefined()
  })

  it("falls back to the user role when the API sends none", async () => {
    const { role: _role, ...noRole } = ada
    server.use(http.get(USERS_URL, () => HttpResponse.json(pageOf([noRole]))))

    const { users } = await getUsers({ page: 1, q: "" })

    expect(users[0]?.role).toBe("user")
  })

  it("uses the search endpoint and encodes the term", async () => {
    let params: URLSearchParams | undefined
    server.use(
      http.get(`${USERS_URL}/search`, ({ request }) => {
        params = new URL(request.url).searchParams
        return HttpResponse.json(pageOf([ada]))
      })
    )

    await getUsers({ page: 1, q: "  ada & co " })

    expect(params?.get("q")).toBe("ada & co")
    expect(params?.get("skip")).toBe("0")
  })

  it("treats a blank search as no search", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json(pageOf([ada]))))

    await expect(getUsers({ page: 1, q: "   " })).resolves.toEqual(pageOf([ada]))
  })

  it("drops fields the app does not use", async () => {
    server.use(
      http.get(USERS_URL, () => HttpResponse.json(pageOf([{ ...ada, password: "secret" }])))
    )

    const { users } = await getUsers({ page: 1, q: "" })

    expect(users[0]).not.toHaveProperty("password")
  })

  it("throws an ApiError when the API fails", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json({ message: "Down" }, { status: 503 })))

    await expect(getUsers({ page: 1, q: "" })).rejects.toMatchObject({
      name: "ApiError",
      status: 503
    })
  })

  it("throws an ApiError when the response has the wrong shape", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json({ users: "nope" })))

    await expect(getUsers({ page: 1, q: "" })).rejects.toBeInstanceOf(ApiError)
  })
})
