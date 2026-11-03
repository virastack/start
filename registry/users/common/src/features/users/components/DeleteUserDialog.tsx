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
            Delete {user.firstName} {user.lastName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sends a real DELETE request to the DummyJSON demo API. It stores nothing, so the user
            comes back when the list loads again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteUser.isError ? (
          <p role="alert" className="text-sm text-destructive">
            Could not delete the user. {getErrorMessage(deleteUser.error)}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={() => deleteUser.mutate(user.id, { onSuccess: () => onOpenChange(false) })}
          >
            {deleteUser.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
