"use client"

import { mergeProps } from "@virastack/password"
import type { UseViraPasswordResult } from "@virastack/password"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PasswordInputProps = {
  /** One field of `useViraPassword(form, …)`: its input props, `register()` included, and toggle. */
  password: UseViraPasswordResult
  /** The id of the field's error message, while it has one. */
  errorId?: string
  capsLockHint: string
}

/**
 * The toggle of the Password page's demo on virastack.com, as its shadcn/ui example draws it: a
 * ghost icon button inside the input, the package's own eye icons. Shared by the three password
 * fields, with a Caps Lock hint.
 */
export function PasswordInput({ password, errorId, capsLockHint }: PasswordInputProps) {
  const { children, ...toggle } = password.btnProps

  return (
    <>
      <div className="relative w-full">
        {/* `mergeProps` joins `aria-describedby`, so the error's id adds to the strength's. */}
        <Input
          {...mergeProps(
            password.inputProps,
            errorId ? { "aria-invalid": true, "aria-describedby": errorId } : undefined
          )}
          className="pr-10"
        />
        {/* `icon` is the templates' small icon size; the class sets the demo's 28px. */}
        <Button
          variant="ghost"
          size="icon"
          {...toggle}
          className="absolute inset-y-0 right-1 my-auto size-7 text-muted-foreground hover:text-foreground"
        >
          {children}
        </Button>
      </div>
      {password.capsLock ? <p className="text-xs text-muted-foreground">{capsLockHint}</p> : null}
    </>
  )
}
