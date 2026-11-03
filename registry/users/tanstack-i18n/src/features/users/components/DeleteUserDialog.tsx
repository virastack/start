"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { getErrorMessage } from "@/features/users/helpers/get-error-message"
import { useDeleteUser } from "@/features/users/hooks/use-delete-user"
import type { User } from "@/features/users/schemas/user.schema"
import * as m from "@/paraglide/messages.js"

type DeleteUserDialogProps = {
  user: User
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function DeleteUserDialog({ user, isOpen, onOpenChange }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser()

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(nextIsOpen) => {
        deleteUser.reset()
        onOpenChange(nextIsOpen)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {m.users_delete_title({ name: `${user.firstName} ${user.lastName}` })}
          </AlertDialogTitle>
          <AlertDialogDescription>{m.users_delete_description()}</AlertDialogDescription>
        </AlertDialogHeader>
        {deleteUser.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {m.users_delete_failed({ reason: getErrorMessage(deleteUser.error) })}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>{m.users_delete_cancel()}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={() => deleteUser.mutate(user.id, { onSuccess: () => onOpenChange(false) })}
          >
            {deleteUser.isPending ? m.users_deleting() : m.users_delete_confirm()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
