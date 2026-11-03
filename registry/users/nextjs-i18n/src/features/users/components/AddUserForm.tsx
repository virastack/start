"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { UserForm } from "@/features/users/components/UserForm"
import { useAddUser } from "@/features/users/hooks/use-add-user"

const EMPTY_VALUES = {
  firstName: "",
  lastName: "",
  username: "",
  title: "",
  department: "",
  role: "user"
} as const

export function AddUserForm() {
  const t = useTranslations("Users")
  const addUser = useAddUser()

  if (addUser.data) {
    const { id, firstName, lastName, username } = addUser.data

    return (
      <div role="status" className="flex flex-col gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">{t("add_result", { id })}</p>
          <p className="mt-1 font-medium">
            {firstName} {lastName}
          </p>
          <p className="text-sm break-all text-muted-foreground">@{username}</p>
        </div>
        <p className="rounded-lg bg-muted p-4 text-sm">
          {t.rich("add_not_saved", {
            strong: (chunks) => <strong className="font-medium">{chunks}</strong>
          })}
        </p>
        <Button variant="outline" className="self-start" onClick={() => addUser.reset()}>
          {t("add_another_user")}
        </Button>
      </div>
    )
  }

  return (
    <UserForm
      defaultValues={EMPTY_VALUES}
      submitLabel={t("add_user")}
      submittingLabel={t("adding_user")}
      formatError={(error) => t("add_error", { error })}
      onSubmit={(input) => addUser.mutateAsync(input)}
    />
  )
}
