import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { login } from "@/features/auth/api/login.api"
import { register } from "@/features/auth/api/register.api"
import { LOGIN_PATH, REGISTER_PATH } from "@/features/auth/constants/auth.constants"
import { server } from "@/test/server"

const LOGIN_URL = `${siteConfig.apiUrl}${LOGIN_PATH}`
const REGISTER_URL = `${siteConfig.apiUrl}${REGISTER_PATH}`

/** The user as DummyJSON's sign-in sends it, tokens included. */
const emily = {
  id: 1,
  username: "emilys",
  email: "emily.johnson@x.dummyjson.com",
  firstName: "Emily",
  lastName: "Johnson",
  gender: "female",
  image: "https://dummyjson.com/icon/emilys/128"
}

describe("login", () => {
  it("posts the credentials and keeps the user without the tokens", async () => {
    let body: unknown
    server.use(
      http.post(LOGIN_URL, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({
          ...emily,
          accessToken: "access-token-xyzzy",
          refreshToken: "refresh-token-plugh"
        })
      })
    )

    const user = await login({ username: "emilys", password: "emilyspass" })

    expect(body).toEqual({ username: "emilys", password: "emilyspass" })
    expect(user).toEqual({
      id: 1,
      username: "emilys",
      email: "emily.johnson@x.dummyjson.com",
      firstName: "Emily",
      lastName: "Johnson",
      image: "https://dummyjson.com/icon/emilys/128"
    })
    expect(JSON.stringify(user)).not.toMatch(/xyzzy|plugh/)
  })

  it("fails with the API's status for wrong credentials", async () => {
    server.use(
      http.post(LOGIN_URL, () =>
        HttpResponse.json({ message: "Invalid credentials" }, { status: 400 })
      )
    )

    await expect(login({ username: "emilys", password: "nope" })).rejects.toMatchObject({
      kind: "http",
      status: 400
    })
  })
})

describe("register", () => {
  it("sends the password once, without the confirmation, and drops its echo", async () => {
    let body: unknown
    server.use(
      http.post(REGISTER_URL, async ({ request }) => {
        body = await request.json()
        // DummyJSON echoes what it was sent, the password too.
        return HttpResponse.json({ ...Object(body), id: 209, role: "user" }, { status: 201 })
      })
    )

    const created = await register({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada.lovelace",
      email: "ada@example.com",
      password: "velvet-river-compass-7",
      confirmPassword: "velvet-river-compass-7"
    })

    expect(body).toEqual({
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada.lovelace",
      email: "ada@example.com",
      password: "velvet-river-compass-7"
    })
    expect(created).toEqual({
      id: 209,
      firstName: "Ada",
      lastName: "Lovelace",
      username: "ada.lovelace",
      email: "ada@example.com"
    })
  })
})
