import type { UserRole } from "@/features/users/schemas/user.schema"

export const USERS_PATH = "/users"
export const USERS_PAGE_SIZE = 10
export const SEARCH_DEBOUNCE_MS = 300

export const ROLE_BADGE_CLASS_NAMES: Record<UserRole, string> = {
  admin: "border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-300",
  moderator: "border-transparent bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  user: "border-transparent bg-muted text-foreground"
}
