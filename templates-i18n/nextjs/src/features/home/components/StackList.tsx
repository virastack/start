/* eslint-disable no-restricted-imports -- package.json sits outside src, beyond the @/* alias */
import { useTranslations } from "next-intl"

import { STACK } from "@/features/home/constants/home.constants"
import { parseVersion } from "@/features/home/helpers/parse-version"

import { dependencies, devDependencies } from "../../../../package.json"

const versions: Record<string, string> = { ...devDependencies, ...dependencies }

export function StackList() {
  const t = useTranslations("Home")

  return (
    <ul aria-label={t("stack_label")} className="flex flex-wrap justify-center gap-2 lg:-mx-28">
      {STACK.map(({ name, packageName, icon: Icon }) => {
        const range = packageName ? versions[packageName] : undefined

        return (
          <li
            key={name}
            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm"
          >
            <Icon className="size-4 shrink-0" />
            {name}
            {range && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {parseVersion(range)}
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
