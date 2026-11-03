import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { ROLE_BADGE_CLASS_NAMES } from "@/features/users/constants/users.constants"
import type { UserRole } from "@/features/users/schemas/user.schema"

export function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant="outline" className={cn("capitalize", ROLE_BADGE_CLASS_NAMES[role])}>
      {role}
    </Badge>
  )
}
