"use client"

import { useTranslations } from "next-intl"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { UserForm } from "@/features/users/components/UserForm"
import { useUpdateUser } from "@/features/users/hooks/use-update-user"
import type { User, UserFormInput } from "@/features/users/schemas/user.schema"

type EditUserDialogProps = {
  user: User
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function EditUserDialog({ user, isOpen, onOpenChange }: EditUserDialogProps) {
  const t = useTranslations("Users")
  const updateUser = useUpdateUser()

  const onSubmit = async (input: UserFormInput) => {
    await updateUser.mutateAsync({ id: user.id, input })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("edit_title")}</DialogTitle>
          <DialogDescription>{t("edit_description")}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so each opening starts from the row's current data. */}
        <UserForm
          defaultValues={{
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            title: user.company?.title ?? "",
            department: user.company?.department ?? "",
            role: user.role
          }}
          submitLabel={t("edit_save")}
          submittingLabel={t("edit_saving")}
          formatError={(error) => t("edit_error", { error })}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
