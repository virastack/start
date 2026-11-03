import { api } from "@/lib/api"

import { USERS_PATH } from "@/features/users/constants/users.constants"
import { toUserBody } from "@/features/users/helpers/to-user-body"
import { userSchema } from "@/features/users/schemas/user.schema"
import type { User, UserFormInput } from "@/features/users/schemas/user.schema"

/** DummyJSON answers as if the user was created, but it does not store it. */
export function addUser(input: UserFormInput, signal?: AbortSignal): Promise<User> {
  return api.post(`${USERS_PATH}/add`, toUserBody(input), { schema: userSchema, signal })
}
