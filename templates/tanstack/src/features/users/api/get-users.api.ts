import { api } from "@/lib/api"

import { USERS_PAGE_SIZE, USERS_PATH } from "@/features/users/constants/users.constants"
import { usersPageSchema } from "@/features/users/schemas/user.schema"
import type { UsersPage } from "@/features/users/schemas/user.schema"
import type { UsersFilters } from "@/features/users/schemas/users-params.schema"

export function getUsers({ page, q }: UsersFilters, signal?: AbortSignal): Promise<UsersPage> {
  const params = new URLSearchParams({
    limit: String(USERS_PAGE_SIZE),
    skip: String((page - 1) * USERS_PAGE_SIZE)
  })
  const search = q.trim()
  if (search) params.set("q", search)

  const path = search ? `${USERS_PATH}/search` : USERS_PATH

  return api.get(`${path}?${params}`, { schema: usersPageSchema, signal })
}
