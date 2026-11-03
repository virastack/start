"use client"

import { useState } from "react"

import { cn } from "cn"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { DeleteUserDialog } from "@/features/users/components/DeleteUserDialog"
import { EditUserDialog } from "@/features/users/components/EditUserDialog"
import { UserActionsMenu } from "@/features/users/components/UserActionsMenu"
import type { UserAction } from "@/features/users/components/UserActionsMenu"
import { UserDetailsDialog } from "@/features/users/components/UserDetailsDialog"
import { UserRoleBadge } from "@/features/users/components/UserRoleBadge"
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
  const [action, setAction] = useState<UserAction | null>(null)
  /** Stays set while a dialog closes, so its content does not vanish during the animation. */
  const [target, setTarget] = useState<User | null>(null)
  const dialogProps = (dialog: UserAction) => ({
    isOpen: action === dialog,
    onOpenChange: (isOpen: boolean) => setAction(isOpen ? dialog : null)
  })

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className={cn(ROW_INSET, "hover:bg-transparent")}>
            <TableHead className="h-11 pr-3 pl-4 font-medium text-foreground">User</TableHead>
            <TableHead className="hidden h-11 px-3 font-medium text-foreground md:table-cell">
              Position
            </TableHead>
            <TableHead className="hidden h-11 w-28 px-3 font-medium text-foreground sm:table-cell">
              Role
            </TableHead>
            <TableHead className="h-11 w-14 pr-4 text-right font-medium text-foreground sm:w-22">
              <span className="sr-only sm:not-sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const name = `${user.firstName} ${user.lastName}`
            const roleBadge = <UserRoleBadge role={user.role} />

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
                <TableCell className="py-3 pr-4 text-right">
                  <UserActionsMenu
                    userName={name}
                    onAction={(nextAction) => {
                      setTarget(user)
                      setAction(nextAction)
                    }}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      {target ? (
        <>
          <UserDetailsDialog user={target} {...dialogProps("view")} />
          <EditUserDialog user={target} {...dialogProps("edit")} />
          <DeleteUserDialog user={target} {...dialogProps("delete")} />
        </>
      ) : null}
    </div>
  )
}
