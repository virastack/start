"use client"

import { useTranslations } from "next-intl"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/features/auth/hooks/use-logout"
import type { SessionUser } from "@/features/auth/schemas/auth.schema"

/** What the sign-in page shows once signed in. With your app, send the visitor on instead. */
export function SignedInCard({ user }: { user: SessionUser }) {
  const t = useTranslations("Auth")
  const logout = useLogout()
  const name = `${user.firstName} ${user.lastName}`

  return (
    <div role="status" className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Avatar>
          <AvatarImage src={user.image} alt="" />
          <AvatarFallback>{`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{t("signed_in_as")}</p>
          <p className="font-medium">{name}</p>
          <p className="text-sm break-all text-muted-foreground">
            @{user.username} · {user.email}
          </p>
        </div>
      </div>
      <p className="rounded-lg bg-muted p-4 text-sm">
        <strong className="font-medium">{t("signed_in_note")}</strong> {t("signed_in_note_reason")}
      </p>
      <Button
        variant="outline"
        className="self-start"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        {t("sign_out")}
      </Button>
    </div>
  )
}
