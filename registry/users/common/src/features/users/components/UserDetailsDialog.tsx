"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { UserRoleBadge } from "@/features/users/components/UserRoleBadge"
import { getAvatarTint } from "@/features/users/helpers/get-avatar-tint"
import { getInitials } from "@/features/users/helpers/get-initials"
import type { User } from "@/features/users/schemas/user.schema"

type UserDetailsDialogProps = {
  user: User
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function UserDetailsDialog({ user, isOpen, onOpenChange }: UserDetailsDialogProps) {
  const name = `${user.firstName} ${user.lastName}`

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User details</DialogTitle>
          <DialogDescription>
            Shows the data already in the table, with no request.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback className={getAvatarTint(user.id)}>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            <p className="truncate text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>
        <dl className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-3 rounded-lg border p-4 text-sm">
          <dt className="text-muted-foreground">Position</dt>
          <dd className="min-w-0 break-words">{user.company?.title ?? "—"}</dd>
          <dt className="text-muted-foreground">Department</dt>
          <dd className="min-w-0 break-words">{user.company?.department ?? "—"}</dd>
          <dt className="text-muted-foreground">Role</dt>
          <dd>
            <UserRoleBadge role={user.role} />
          </dd>
        </dl>
      </DialogContent>
    </Dialog>
  )
}
