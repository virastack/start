"use client"

import type { ComponentProps } from "react"

import type { UseViraPasswordResult } from "@virastack/password"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PasswordInputProps = ComponentProps<typeof Input> & {
  /** What `useViraPassword` returns for this field: its input props and its toggle. */
  password: UseViraPasswordResult
  capsLockHint: string
}

/** shadcn's input with the hook's show and hide button inside it. */
export function PasswordInput({ password, capsLockHint, className, ...props }: PasswordInputProps) {
  const { children, ...toggle } = password.btnProps

  return (
    <>
      <div className="relative">
        {/* The hook's props hold attributes only, so `register()` keeps its ref and handlers. */}
        <Input {...password.inputProps} {...props} className={cn("pr-10", className)} />
        <Button
          variant="ghost"
          size="icon"
          {...toggle}
          className="absolute top-0 right-0 text-muted-foreground hover:bg-transparent"
        >
          {children}
        </Button>
      </div>
      {password.capsLock ? <p className="text-xs text-muted-foreground">{capsLockHint}</p> : null}
    </>
  )
}
