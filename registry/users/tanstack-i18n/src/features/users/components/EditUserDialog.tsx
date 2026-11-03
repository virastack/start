"use client"

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
import * as m from "@/paraglide/messages.js"

type EditUserDialogProps = {
  user: User
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export function EditUserDialog({ user, isOpen, onOpenChange }: EditUserDialogProps) {
  const updateUser = useUpdateUser()

  const onSubmit = async (input: UserFormInput) => {
    await updateUser.mutateAsync({ id: user.id, input })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.users_edit_title()}</DialogTitle>
          <DialogDescription>{m.users_edit_description()}</DialogDescription>
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
          submitLabel={m.users_edit_save()}
          submittingLabel={m.users_edit_saving()}
          formatError={(reason) => m.users_edit_failed({ reason })}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}
