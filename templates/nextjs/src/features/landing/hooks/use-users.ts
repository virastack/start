"use client";

import { useQuery } from "@tanstack/react-query";

import { getUsers } from "@/features/landing/api";

/**
 * Example TanStack Query hook. Lives with the landing demo feature —
 * delete `src/features/landing` when you start your real product.
 */
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}
