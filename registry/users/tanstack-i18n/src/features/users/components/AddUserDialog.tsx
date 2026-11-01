"use client"

import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { AddUserForm } from "@/features/users/components/AddUserForm"
import * as m from "@/paraglide/messages.js"

export function AddUserDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button className="shrink-0" />}>
        <PlusIcon aria-hidden />
        {m.users_add()}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{m.users_add()}</DialogTitle>
          <DialogDescription>{m.users_add_description()}</DialogDescription>
        </DialogHeader>
        <AddUserForm />
      </DialogContent>
    </Dialog>
  )
}
