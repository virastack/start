import { api } from "@/lib/api"

import { USERS_PATH } from "@/features/users/constants/users.constants"
import { deletedUserSchema } from "@/features/users/schemas/user.schema"

/** DummyJSON answers as if the user was deleted, but the user stays on its side. */
export function deleteUser(id: number) {
  return api.delete(`${USERS_PATH}/${id}`, { schema: deletedUserSchema })
}
