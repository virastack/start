"use client"

import { useQuery } from "@tanstack/react-query"

import { sessionQueryOptions } from "@/features/auth/api/session.queries"

/** The signed-in user, or `null`. What the rest of the app reads to know who is signed in. */
export function useSession() {
  return useQuery(sessionQueryOptions)
}
