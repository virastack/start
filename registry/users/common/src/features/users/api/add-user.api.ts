import { api } from "@/lib/api"

import { USERS_PATH } from "@/features/users/constants/users.constants"
import { userSchema } from "@/features/users/schemas/user.schema"
import type { AddUserInput, User } from "@/features/users/schemas/user.schema"

/** DummyJSON answers as if the user was created, but it does not store it. */
export function addUser(input: AddUserInput, signal?: AbortSignal): Promise<User> {
  return api.post(`${USERS_PATH}/add`, input, { schema: userSchema, signal })
}
