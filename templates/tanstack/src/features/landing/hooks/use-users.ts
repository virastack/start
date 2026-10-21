"use client";

import { useQuery } from "@tanstack/react-query";

import { usersQueryOptions } from "@/features/landing/api";

/**
 * Example TanStack Query hook for the landing Showcase demo.
 *
 * Demo-only: client `useQuery` is intentional here (interactive table + nuqs).
 * Production routes should prefetch in a route `loader` per the ViraStack AI `tanstack-start` rule.
 * Delete `src/features/landing` when you start your real product.
 */
export function useUsers() {
  return useQuery(usersQueryOptions());
}
