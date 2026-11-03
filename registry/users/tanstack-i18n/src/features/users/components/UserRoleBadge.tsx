import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { ROLE_BADGE_CLASS_NAMES } from "@/features/users/constants/users.constants"
import type { UserRole } from "@/features/users/schemas/user.schema"
import * as m from "@/paraglide/messages.js"

const ROLE_LABELS = {
  admin: m.users_role_admin,
  moderator: m.users_role_moderator,
  user: m.users_role_user
}

export function UserRoleBadge({ role }: { role: UserRole }) {
  return (
    <Badge variant="outline" className={cn("capitalize", ROLE_BADGE_CLASS_NAMES[role])}>
      {ROLE_LABELS[role]()}
    </Badge>
  )
}
