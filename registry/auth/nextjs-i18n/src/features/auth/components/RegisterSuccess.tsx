import { useTranslations } from "next-intl"

import { Button, buttonVariants } from "@/components/ui/button"
import { AuthLink } from "@/features/auth/components/AuthLink"
import { LOGIN_ROUTE } from "@/features/auth/constants/auth.constants"
import type { RegisteredUser } from "@/features/auth/schemas/auth.schema"

type RegisterSuccessProps = {
  user: RegisteredUser
  onReset: () => void
}

export function RegisterSuccess({ user, onReset }: RegisterSuccessProps) {
  const t = useTranslations("Auth")

  return (
    <div role="status" className="flex flex-col gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">{t("register_result", { id: user.id })}</p>
        <p className="mt-1 font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm break-all text-muted-foreground">
          @{user.username} · {user.email}
        </p>
      </div>
      <p className="rounded-lg bg-muted p-4 text-sm">
        <strong className="font-medium">{t("register_not_saved")}</strong>{" "}
        {t("register_not_saved_reason")}
      </p>
      <div className="flex flex-wrap gap-2">
        <AuthLink href={LOGIN_ROUTE} className={buttonVariants()}>
          {t("go_to_sign_in")}
        </AuthLink>
        <Button variant="outline" onClick={onReset}>
          {t("create_another")}
        </Button>
      </div>
    </div>
  )
}
