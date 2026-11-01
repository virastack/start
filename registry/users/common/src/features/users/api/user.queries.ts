import { keepPreviousData, queryOptions } from "@tanstack/react-query"

import { getUsers } from "@/features/users/api/get-users.api"
import { userKeys } from "@/features/users/api/query-keys"
import type { UsersFilters } from "@/features/users/schemas/users-params.schema"

export const usersQueryOptions = ({ page, q }: UsersFilters) => {
  const filters = { page, q: q.trim() }

  return queryOptions({
    queryKey: userKeys.list(filters),
    queryFn: ({ signal }) => getUsers(filters, signal),
    placeholderData: keepPreviousData
  })
}
