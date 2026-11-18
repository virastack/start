"use client"

import type { UseViraPasswordResult } from "@virastack/password"
import { cn } from "cn"

import { PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"

// Filled bars and colour per level, as on the Password page of virastack.com: weak 1, fair 2,
// good 3, strong 4. Whole class names, so Tailwind finds them in the source.
const BARS = {
  weak: [1, "bg-red-500"],
  fair: [2, "bg-amber-500"],
  good: [3, "bg-lime-500"],
  strong: [4, "bg-green-600"]
} as const

const LEVELS = { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" } as const

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
          ? `Strength: ${LEVELS[strength.level]}`
          : `${PASSWORD_POLICY.minLength} characters or more`}
      </p>
    </div>
  )
}
