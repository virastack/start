"use client"

import type { UseViraPasswordResult } from "@virastack/password"
import type { StrengthLevel } from "@virastack/password/strength"
import { cn } from "cn"

import { PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"
import * as m from "@/paraglide/messages"

// Filled bars and colour per level, as on the Password page of virastack.com: weak 1, fair 2,
// good 3, strong 4. Whole class names, so Tailwind finds them in the source.
const BARS = {
  weak: [1, "bg-red-500"],
  fair: [2, "bg-amber-500"],
  good: [3, "bg-lime-500"],
  strong: [4, "bg-green-600"]
} as const

// Functions, so each call words it in the visitor's language.
const LEVELS: Record<StrengthLevel, () => string> = {
  weak: m.auth_level_weak,
  fair: m.auth_level_fair,
  good: m.auth_level_good,
  strong: m.auth_level_strong
}

type PasswordStrengthProps = Pick<UseViraPasswordResult, "strength" | "strengthProps">

/** The bar is the module's; the package only scores the password. */
export function PasswordStrength({ strength, strengthProps }: PasswordStrengthProps) {
  const typed = strength !== null && strength.length > 0
  const [filled, barColor] = typed ? BARS[strength.level] : [0, ""]

  return (
    <div className="flex flex-col gap-2">
      <div aria-hidden className="grid grid-cols-4 gap-1">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={cn(
              "h-1 rounded-full transition-colors",
              filled >= step ? barColor : "bg-muted"
            )}
          />
        ))}
      </div>
      {/* The field's description: a live region with the level only, so typing stays quiet. */}
      <p {...strengthProps} className="text-xs text-muted-foreground">
        {typed
          ? m.auth_strength({ level: LEVELS[strength.level]() })
          : m.auth_strength_hint({ min: PASSWORD_POLICY.minLength })}
      </p>
    </div>
  )
}
