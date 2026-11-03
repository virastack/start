import { api } from "@/lib/api"

import { USERS_PATH } from "@/features/users/constants/users.constants"
import { toUserBody } from "@/features/users/helpers/to-user-body"
import { userSchema } from "@/features/users/schemas/user.schema"
import type { User, UserFormInput } from "@/features/users/schemas/user.schema"

/** DummyJSON answers with the changed user, but it does not store the change. */
export function updateUser(id: number, input: UserFormInput): Promise<User> {
  return api.put(`${USERS_PATH}/${id}`, toUserBody(input), { schema: userSchema })
}
