import type { ReactNode } from "react"

type UsersMessageProps = {
  title: string
  description: string
  action?: ReactNode
  role?: "alert"
}

/** The empty and error states of the list. */
export function UsersMessage({ title, description, action, role }: UsersMessageProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center gap-3 rounded-lg border px-4 py-16 text-center"
    >
      <div>
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}
