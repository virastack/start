import { Button, buttonVariants } from "@/components/ui/button"
import { AuthLink } from "@/features/auth/components/AuthLink"
import { LOGIN_ROUTE } from "@/features/auth/constants/auth.constants"
import type { RegisteredUser } from "@/features/auth/schemas/auth.schema"

type RegisterSuccessProps = {
  user: RegisteredUser
  onReset: () => void
}

export function RegisterSuccess({ user, onReset }: RegisterSuccessProps) {
  return (
    <div role="status" className="flex flex-col gap-4">
      <div className="rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">The API returned user #{user.id}</p>
        <p className="mt-1 font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm break-all text-muted-foreground">
          @{user.username} · {user.email}
        </p>
      </div>
      <p className="rounded-lg bg-muted p-4 text-sm">
        <strong className="font-medium">This account was not saved.</strong> DummyJSON is a demo
        API: it returns the new user but does not store it, so you cannot sign in with it. Try the
        demo account on the sign-in page.
      </p>
      <div className="flex flex-wrap gap-2">
        <AuthLink href={LOGIN_ROUTE} className={buttonVariants()}>
          Go to sign in
        </AuthLink>
        <Button variant="outline" onClick={onReset}>
          Create another account
        </Button>
      </div>
    </div>
  )
}
