"use client"

import { useTranslations } from "next-intl"

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
import { useDeleteUser } from "@/features/users/hooks/use-delete-user"
import { useErrorMessage } from "@/features/users/hooks/use-error-message"
import type { User } from "@/features/users/schemas/user.schema"

type DeleteUserDialogProps = {
  user: User
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function DeleteUserDialog({ user, isOpen, onOpenChange }: DeleteUserDialogProps) {
  const t = useTranslations("Users")
  const getErrorMessage = useErrorMessage()
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
            {t("delete_title", { name: `${user.firstName} ${user.lastName}` })}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("delete_description")}</AlertDialogDescription>
        </AlertDialogHeader>
        {deleteUser.isError ? (
          <p role="alert" className="text-sm text-destructive">
            {t("delete_error", { error: getErrorMessage(deleteUser.error) })}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>{t("delete_cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={() => deleteUser.mutate(user.id, { onSuccess: () => onOpenChange(false) })}
          >
            {deleteUser.isPending ? t("deleting") : t("delete_confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
