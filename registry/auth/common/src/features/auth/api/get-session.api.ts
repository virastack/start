import type { SessionUser } from "@/features/auth/schemas/auth.schema"

/**
 * No request yet: DummyJSON's `/auth/me` needs the token this module never keeps, so a reload
 * starts signed out. With your API, ask it who the cookie belongs to:
 * `api.get("/auth/me", { schema: sessionUserSchema })`, and answer `null` on a 401.
 */
export async function getSession(): Promise<SessionUser | null> {
  return null
}
