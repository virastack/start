import { cn } from "cn"
import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { FavoriteButton } from "@/features/users/components/FavoriteButton"
import { ROLE_BADGE_CLASS_NAMES } from "@/features/users/constants/users.constants"
import { getAvatarTint } from "@/features/users/helpers/get-avatar-tint"
import { getInitials } from "@/features/users/helpers/get-initials"
import type { User } from "@/features/users/schemas/user.schema"

/**
 * The line and the fill stop 8px short of the table's edges. They are backgrounds because a
 * row cannot be inset, and a pseudo element would add a cell to it.
 */
const ROW_INSET =
  "border-0 bg-transparent bg-[linear-gradient(var(--row-line),var(--row-line)),linear-gradient(var(--row-fill),var(--row-fill))] bg-no-repeat [--row-fill:transparent] [--row-line:var(--border)] [background-position:bottom,center] [background-size:calc(100%-16px)_1px,calc(100%-16px)_100%] last:[--row-line:transparent]"
const ROW_ZEBRA =
  "even:[--row-fill:color-mix(in_oklab,var(--muted)_30%,transparent)] hover:bg-transparent hover:[--row-fill:color-mix(in_oklab,var(--muted)_60%,transparent)]"

type UsersTableProps = {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const t = useTranslations("Users")

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className={cn(ROW_INSET, "hover:bg-transparent")}>
            <TableHead className="h-11 pr-3 pl-4 font-medium text-foreground">
              {t("column_user")}
            </TableHead>
            <TableHead className="hidden h-11 px-3 font-medium text-foreground md:table-cell">
              {t("column_position")}
            </TableHead>
            <TableHead className="hidden h-11 w-28 px-3 font-medium text-foreground sm:table-cell">
              {t("column_role")}
            </TableHead>
            <TableHead className="h-11 w-16">
              <span className="sr-only">{t("column_favorite")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const name = `${user.firstName} ${user.lastName}`
            const roleBadge = (
              <Badge
                variant="outline"
                className={cn("capitalize", ROLE_BADGE_CLASS_NAMES[user.role])}
              >
                {t(`role_${user.role}`)}
              </Badge>
            )

            return (
              <TableRow key={user.id} className={cn(ROW_INSET, ROW_ZEBRA)}>
                <TableCell className="py-3 pr-3 pl-4">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={getAvatarTint(user.id)}>
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{name}</p>
                        <span className="shrink-0 sm:hidden">{roleBadge}</span>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden px-3 py-3 md:table-cell">
                  <p title={user.company?.title} className="truncate text-sm text-foreground">
                    {user.company?.title ?? "—"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.company?.department}
                  </p>
                </TableCell>
                <TableCell className="hidden px-3 py-3 sm:table-cell">{roleBadge}</TableCell>
                <TableCell className="px-0 py-3 text-center">
                  <FavoriteButton userId={user.id} userName={name} />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
