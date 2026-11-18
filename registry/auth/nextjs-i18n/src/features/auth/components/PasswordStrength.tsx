"use client"

import { CheckIcon, XIcon } from "lucide-react"
import type { UseViraPasswordResult } from "@virastack/password"
import type { PasswordChecks } from "@virastack/password/strength"
import { cn } from "cn"
import { useTranslations } from "next-intl"

import { PASSWORD_POLICY } from "@/features/auth/constants/auth.constants"

const FILLED_BARS = { weak: 1, fair: 2, good: 3, strong: 4 } as const

const LEVELS = {
  weak: "level_weak",
  fair: "level_fair",
  good: "level_good",
  strong: "level_strong"
} as const

const RULES = [
  { id: "rule_length", isMet: (checks: PasswordChecks) => checks.minLength && checks.maxLength },
  { id: "rule_common", isMet: (checks: PasswordChecks) => checks.notCommon },
  { id: "rule_repetitive", isMet: (checks: PasswordChecks) => checks.notRepetitive },
  { id: "rule_personal", isMet: (checks: PasswordChecks) => checks.notPersonal }
] as const

type PasswordStrengthProps = Pick<UseViraPasswordResult, "strength" | "strengthProps">

/** The bar and the rules are the module's; the package only scores the password. */
export function PasswordStrength({ strength, strengthProps }: PasswordStrengthProps) {
  const t = useTranslations("Auth")
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
        {typed ? t("strength", { level: t(LEVELS[strength.level]) }) : t("strength_hint")}
      </p>
      <ul className="flex flex-col gap-1 text-xs">
        {RULES.map(({ id, isMet }) => {
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
              <span className="sr-only">{met ? t("rule_met") : t("rule_not_met")} </span>
              {t(id, { min: PASSWORD_POLICY.minLength, max: PASSWORD_POLICY.maxLength })}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
