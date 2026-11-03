"use client"

import { MoreHorizontalIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export type UserAction = "view" | "edit" | "delete"

type UserActionsMenuProps = {
  userName: string
  onAction: (action: UserAction) => void
}

export function UserActionsMenu({ userName, onAction }: UserActionsMenuProps) {
  const t = useTranslations("Users")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={t("open_actions", { name: userName })}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAction("view")}>{t("action_view")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit")}>{t("action_edit")}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onAction("delete")}>
          {t("action_delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
