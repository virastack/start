import type { ComponentType } from "react"

import { ReactIcon } from "@/features/home/icons/react"
import { ReactHookFormIcon } from "@/features/home/icons/react-hook-form"
import { ShadcnIcon } from "@/features/home/icons/shadcn"
import { TailwindIcon } from "@/features/home/icons/tailwind"
import { TanstackIcon } from "@/features/home/icons/tanstack"
import { TypescriptIcon } from "@/features/home/icons/typescript"
import { ZodIcon } from "@/features/home/icons/zod"
import { ZustandIcon } from "@/features/home/icons/zustand"

type StackItem = {
  name: string
  /** The package.json entry the version is read from. shadcn/ui ships no package, so it has none. */
  packageName?: string
  icon: ComponentType<{ className?: string }>
}

/** Where the demo lives. `null` when it is not installed, which also hides the links to it. */
export const DEMO_PATH = "/users" as string | null

export const NEXT_STEPS = [
  { title: "Replace this page", path: "src/routes/index.tsx" },
  { title: "Add your first feature", path: "src/features/<name>" },
  ...(DEMO_PATH
    ? [
        {
          title: "Remove the demo",
          path: "src/features/users, src/routes/users.tsx, DEMO_PATH = null"
        }
      ]
    : [])
]

export const STACK: readonly StackItem[] = [
  { name: "TanStack Start", packageName: "@tanstack/react-start", icon: TanstackIcon },
  { name: "React", packageName: "react", icon: ReactIcon },
  { name: "TypeScript", packageName: "typescript", icon: TypescriptIcon },
  { name: "Tailwind CSS", packageName: "tailwindcss", icon: TailwindIcon },
  { name: "shadcn/ui", icon: ShadcnIcon },
  { name: "TanStack Query", packageName: "@tanstack/react-query", icon: TanstackIcon },
  { name: "Zustand", packageName: "zustand", icon: ZustandIcon },
  { name: "React Hook Form", packageName: "react-hook-form", icon: ReactHookFormIcon },
  { name: "Zod", packageName: "zod", icon: ZodIcon }
]

export const RESOURCE_LINKS = [
  { label: "Docs", href: "https://virastack.com/start/docs" },
  { label: "ViraStack AI", href: "https://virastack.com/ai" },
  { label: "Academy", href: "https://virastack.com/academy" },
  { label: "GitHub", href: "https://github.com/virastack/start" }
] as const
