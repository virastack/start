"use client"

import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import * as m from "@/paraglide/messages.js"

export type UserAction = "view" | "edit" | "delete"

type UserActionsMenuProps = {
  userName: string
  onAction: (action: UserAction) => void
}

export function UserActionsMenu({ userName, onAction }: UserActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={m.users_open_actions({ name: userName })}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onAction("view")}>
          {m.users_action_view()}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAction("edit")}>
          {m.users_action_edit()}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onAction("delete")}>
          {m.users_action_delete()}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
