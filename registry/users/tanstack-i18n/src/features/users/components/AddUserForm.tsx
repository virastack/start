"use client"

import { Button } from "@/components/ui/button"
import { UserForm } from "@/features/users/components/UserForm"
import { useAddUser } from "@/features/users/hooks/use-add-user"
import * as m from "@/paraglide/messages.js"

const EMPTY_VALUES = {
  firstName: "",
  lastName: "",
  username: "",
  title: "",
  department: "",
  role: "user"
} as const

export function AddUserForm() {
  const addUser = useAddUser()

  if (addUser.data) {
    const { id, firstName, lastName, username } = addUser.data

    return (
      <div role="status" className="flex flex-col gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">{m.users_add_returned({ id })}</p>
          <p className="mt-1 font-medium">
            {firstName} {lastName}
          </p>
          <p className="text-sm break-all text-muted-foreground">@{username}</p>
        </div>
        <p className="rounded-lg bg-muted p-4 text-sm">
          <strong className="font-medium">{m.users_add_not_saved()}</strong>{" "}
          {m.users_add_not_saved_reason()}
        </p>
        <Button variant="outline" className="self-start" onClick={() => addUser.reset()}>
          {m.users_add_another()}
        </Button>
      </div>
    )
  }

  return (
    <UserForm
      defaultValues={EMPTY_VALUES}
      submitLabel={m.users_add()}
      submittingLabel={m.users_adding()}
      formatError={(reason) => m.users_add_failed({ reason })}
      onSubmit={(input) => addUser.mutateAsync(input)}
    />
  )
}
