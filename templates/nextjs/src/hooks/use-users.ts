"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

/**
 * Example TanStack Query hook. Delete once you wire up your real API.
 */
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<User[]>("https://jsonplaceholder.typicode.com/users?_limit=5"),
  });
}
