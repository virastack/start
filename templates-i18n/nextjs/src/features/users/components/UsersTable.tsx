import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { FavoriteButton } from "@/features/users/components/FavoriteButton"
import { getInitials } from "@/features/users/helpers/get-initials"
import type { User } from "@/features/users/schemas/user.schema"

type UsersTableProps = {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  const t = useTranslations("Users")

  return (
    <div className="rounded-lg border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>{t("column_user")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("column_email")}</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">{t("column_favorite")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const name = `${user.firstName} ${user.lastName}`

            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden truncate text-muted-foreground sm:table-cell">
                  {user.email}
                </TableCell>
                <TableCell>
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
