import type { UsersFilters } from "@/features/users/schemas/users-params.schema"

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UsersFilters) => [...userKeys.lists(), filters] as const
}
