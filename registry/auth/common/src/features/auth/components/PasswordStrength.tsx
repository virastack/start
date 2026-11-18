"use client"

import { CheckIcon, XIcon } from "lucide-react"
import type { UseViraPasswordResult } from "@virastack/password"
import type { PasswordChecks } from "@virastack/password/strength"
import { cn } from "cn"

import { PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"

const FILLED_BARS = { weak: 1, fair: 2, good: 3, strong: 4 } as const

const LEVELS = { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" } as const

const RULES: { label: string; isMet: (checks: PasswordChecks) => boolean }[] = [
  {
    label: `${PASSWORD_POLICY.minLength} to ${PASSWORD_POLICY.maxLength} characters`,
    isMet: (checks) => checks.minLength && checks.maxLength
  },
  { label: "Not a common password", isMet: (checks) => checks.notCommon },
  { label: "No repeats or sequences like aaaa or 1234", isMet: (checks) => checks.notRepetitive },
  { label: "Not your name, username or email", isMet: (checks) => checks.notPersonal }
]

type PasswordStrengthProps = Pick<UseViraPasswordResult, "strength" | "strengthProps">

/** The bar and the rules are the module's; the package only scores the password. */
export function PasswordStrength({ strength, strengthProps }: PasswordStrengthProps) {
  const typed = strength !== null && strength.length > 0
  const filled = typed ? FILLED_BARS[strength.level] : 0

  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn(
              "h-1 rounded-full bg-muted transition-colors",
              bar <= filled && (strength?.valid ? "bg-primary" : "bg-destructive")
            )}
          />
        ))}
      </div>
      {/* A live region: it announces the level, not every rule, so typing stays quiet. */}
      <p {...strengthProps} className="text-xs text-muted-foreground">
        {typed
          ? `Strength: ${LEVELS[strength.level]}`
          : "Choose a long password you don't use elsewhere"}
      </p>
      <ul className="flex flex-col gap-1 text-xs">
        {RULES.map(({ label, isMet }) => {
          const met = typed && isMet(strength.checks)
          const Icon = met ? CheckIcon : XIcon

          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-1.5",
                met ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon aria-hidden className="size-3.5 shrink-0" />
              <span className="sr-only">{met ? "Met:" : "Not met:"} </span>
              {label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
