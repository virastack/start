import { api, ApiError } from "@/lib/api"

import { USERS_PAGE_SIZE, USERS_URL } from "@/features/users/constants/users.constants"
import { usersPageSchema } from "@/features/users/schemas/user.schema"
import type { UsersPage } from "@/features/users/schemas/user.schema"
import type { UsersFilters } from "@/features/users/schemas/users-params.schema"

export async function getUsers(
  { page, q }: UsersFilters,
  signal?: AbortSignal
): Promise<UsersPage> {
  const params = new URLSearchParams({
    limit: String(USERS_PAGE_SIZE),
    skip: String((page - 1) * USERS_PAGE_SIZE)
  })
  const search = q.trim()
  if (search) params.set("q", search)

  const endpoint = search ? `${USERS_URL}/search` : USERS_URL
  const data = await api.get<unknown>(`${endpoint}?${params}`, { signal })
  const result = usersPageSchema.safeParse(data)

  if (!result.success) {
    throw new ApiError("Unexpected users response", 502, result.error.issues)
  }
  return result.data
}
