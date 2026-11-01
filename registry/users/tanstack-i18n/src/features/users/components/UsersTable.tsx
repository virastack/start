import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { FavoriteButton } from "@/features/users/components/FavoriteButton"
import { RoleBadge } from "@/features/users/components/RoleBadge"
import { getInitials } from "@/features/users/helpers/get-initials"
import type { User, UserRole } from "@/features/users/schemas/user.schema"
import * as m from "@/paraglide/messages.js"
import { getLocale } from "@/paraglide/runtime.js"

const ROLE_LABELS: Record<UserRole, () => string> = {
  admin: () => m.users_role_admin(),
  moderator: () => m.users_role_moderator(),
  user: () => m.users_role_user()
}

type UsersTableProps = {
  users: User[]
}

export function UsersTable({ users }: UsersTableProps) {
  return (
    <div className="rounded-lg border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead>{m.users_column_user()}</TableHead>
            <TableHead className="hidden w-28 sm:table-cell">{m.users_column_role()}</TableHead>
            <TableHead className="hidden sm:table-cell">{m.users_column_email()}</TableHead>
            <TableHead className="w-14">
              <span className="sr-only">{m.users_column_favorite()}</span>
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
                      <AvatarImage src={user.image} alt="" />
                      <AvatarFallback>{getInitials(name, getLocale())}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <RoleBadge role={user.role}>{ROLE_LABELS[user.role]()}</RoleBadge>
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
