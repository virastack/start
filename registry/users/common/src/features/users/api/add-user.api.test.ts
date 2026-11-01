import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { addUser } from "@/features/users/api/add-user.api"
import { USERS_PATH } from "@/features/users/constants/users.constants"
import { server } from "@/test/server"

const ADD_USER_URL = `${siteConfig.apiUrl}${USERS_PATH}/add`
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

    await expect(addUser(input)).resolves.toEqual({
      id: 209,
      username: "",
      role: "user",
      ...input
    })
    expect(body).toEqual(input)
  })
})
