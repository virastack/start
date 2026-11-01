import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { ApiError } from "@/lib/api"

import { addUser } from "@/features/users/api/add-user.api"
import { server } from "@/test/server"

const ADD_USER_URL = "https://dummyjson.com/users/add"
const input = { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" }

describe("addUser", () => {
  it("posts the input and returns the created user", async () => {
    let body: unknown
    server.use(
      http.post(ADD_USER_URL, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 209, username: "", ...input }, { status: 201 })
      })
    )

    await expect(addUser(input)).resolves.toEqual({ id: 209, username: "", ...input })
    expect(body).toEqual(input)
  })

  it("throws an ApiError when the API fails", async () => {
    server.use(http.post(ADD_USER_URL, () => HttpResponse.json({}, { status: 500 })))

    await expect(addUser(input)).rejects.toMatchObject({ name: "ApiError", status: 500 })
  })

  it("throws an ApiError when the response has the wrong shape", async () => {
    server.use(http.post(ADD_USER_URL, () => HttpResponse.json({ id: "209" })))

    await expect(addUser(input)).rejects.toBeInstanceOf(ApiError)
  })
})
