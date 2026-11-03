"use client"

import { useQuery } from "@tanstack/react-query"

import { usersQueryOptions } from "@/features/users/api/user.queries"
import type { UsersFilters } from "@/features/users/schemas/users-params.schema"

export function useUsers(filters: UsersFilters) {
  return useQuery(usersQueryOptions(filters))
}
