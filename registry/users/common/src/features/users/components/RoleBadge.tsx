import type { ReactNode } from "react"

import { cn } from "cn"

import type { UserRole } from "@/features/users/schemas/user.schema"

const ROLE_STYLES: Record<UserRole, string> = {
  admin: "bg-primary text-primary-foreground",
  moderator: "bg-secondary text-secondary-foreground",
  user: "border-border text-muted-foreground"
}

type RoleBadgeProps = {
  role: UserRole
  children: ReactNode
}

export function RoleBadge({ role, children }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border border-transparent px-2 py-0.5 text-xs font-medium",
        "capitalize",
        ROLE_STYLES[role]
      )}
    >
      {children}
    </span>
  )
}
