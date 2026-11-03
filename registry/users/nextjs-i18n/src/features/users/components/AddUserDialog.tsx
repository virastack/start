"use client"

import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"

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

export function AddUserDialog() {
  const t = useTranslations("Users")

  return (
    <Dialog>
      <DialogTrigger render={<Button className="shrink-0" />}>
        <PlusIcon aria-hidden />
        {t("add_user")}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("add_user")}</DialogTitle>
          <DialogDescription>{t("add_user_description")}</DialogDescription>
        </DialogHeader>
        <AddUserForm />
      </DialogContent>
    </Dialog>
  )
}
