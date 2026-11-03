import { http, HttpResponse } from "msw/http"
import { describe, expect, it } from "vitest"

import { siteConfig } from "@/config/site.config"

import { addUser } from "@/features/users/api/add-user.api"
import { USERS_PATH } from "@/features/users/constants/users.constants"
import { server } from "@/test/server"

const ADD_USER_URL = `${siteConfig.apiUrl}${USERS_PATH}/add`
const input = {
  firstName: "Ada",
  lastName: "Lovelace",
  username: "ada.lovelace",
  title: "Mathematician",
  department: "Research",
  role: "user" as const
}
const created = {
  firstName: "Ada",
  lastName: "Lovelace",
  username: "ada.lovelace",
  role: "user",
  company: { title: "Mathematician", department: "Research" }
}

describe("addUser", () => {
  it("posts the position and department under company and returns the created user", async () => {
    let body: unknown
    server.use(
      http.post(ADD_USER_URL, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 209, ...created }, { status: 201 })
      })
    )

    await expect(addUser(input)).resolves.toEqual({ id: 209, ...created })
    expect(body).toEqual(created)
  })
})
