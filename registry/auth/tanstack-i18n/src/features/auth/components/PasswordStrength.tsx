"use client"

import { CheckIcon, XIcon } from "lucide-react"
import type { UseViraPasswordResult } from "@virastack/password"
import type { PasswordChecks, StrengthLevel } from "@virastack/password/strength"
import { cn } from "cn"

import { PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"
import * as m from "@/paraglide/messages"

const FILLED_BARS = { weak: 1, fair: 2, good: 3, strong: 4 } as const

// Functions, so each call words it in the visitor's language.
const LEVELS: Record<StrengthLevel, () => string> = {
  weak: m.auth_level_weak,
  fair: m.auth_level_fair,
  good: m.auth_level_good,
  strong: m.auth_level_strong
}

const RULES: { id: string; label: () => string; isMet: (checks: PasswordChecks) => boolean }[] = [
  {
    id: "length",
    label: () =>
      m.auth_rule_length({ min: PASSWORD_POLICY.minLength, max: PASSWORD_POLICY.maxLength }),
    isMet: (checks) => checks.minLength && checks.maxLength
  },
  { id: "common", label: m.auth_rule_common, isMet: (checks) => checks.notCommon },
  { id: "repetitive", label: m.auth_rule_repetitive, isMet: (checks) => checks.notRepetitive },
  { id: "personal", label: m.auth_rule_personal, isMet: (checks) => checks.notPersonal }
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
        {typed ? m.auth_strength({ level: LEVELS[strength.level]() }) : m.auth_strength_hint()}
      </p>
      <ul className="flex flex-col gap-1 text-xs">
        {RULES.map(({ id, label, isMet }) => {
          const met = typed && isMet(strength.checks)
          const Icon = met ? CheckIcon : XIcon

          return (
            <li
              key={id}
              className={cn(
                "flex items-center gap-1.5",
                met ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon aria-hidden className="size-3.5 shrink-0" />
              <span className="sr-only">{met ? m.auth_rule_met() : m.auth_rule_not_met()} </span>
              {label()}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
