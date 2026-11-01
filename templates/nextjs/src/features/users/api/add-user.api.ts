import { api, ApiError } from "@/lib/api"

import { USERS_URL } from "@/features/users/constants/users.constants"
import { userSchema } from "@/features/users/schemas/user.schema"
import type { AddUserInput, User } from "@/features/users/schemas/user.schema"

/** DummyJSON answers as if the user was created, but it does not store it. */
export async function addUser(input: AddUserInput, signal?: AbortSignal): Promise<User> {
  const data = await api.post<unknown>(`${USERS_URL}/add`, input, { signal })
  const result = userSchema.safeParse(data)

  if (!result.success) {
    throw new ApiError("Unexpected add user response", 502, result.error.issues)
  }
  return result.data
}
