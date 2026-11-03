"use client"

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
  const addUser = useAddUser()

  if (addUser.data) {
    const { id, firstName, lastName, username } = addUser.data

    return (
      <div role="status" className="flex flex-col gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">The API returned user #{id}</p>
          <p className="mt-1 font-medium">
            {firstName} {lastName}
          </p>
          <p className="text-sm break-all text-muted-foreground">@{username}</p>
        </div>
        <p className="rounded-lg bg-muted p-4 text-sm">
          <strong className="font-medium">This user was not saved.</strong> DummyJSON is a demo API:
          it returns the new user but does not store it, so the user will not appear in the list.
        </p>
        <Button variant="outline" className="self-start" onClick={() => addUser.reset()}>
          Add another user
        </Button>
      </div>
    )
  }

  return (
    <UserForm
      defaultValues={EMPTY_VALUES}
      submitLabel="Add user"
      submittingLabel="Adding…"
      errorLabel="Could not add the user."
      onSubmit={(input) => addUser.mutateAsync(input)}
    />
  )
}
