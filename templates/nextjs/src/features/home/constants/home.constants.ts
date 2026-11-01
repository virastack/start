import type { ComponentType } from "react"

import { NextjsIcon } from "@/features/home/icons/nextjs"
import { NuqsIcon } from "@/features/home/icons/nuqs"
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

export const FEATURES_URL = "https://virastack.com/start/features"

export const NEXT_STEPS = [
  { title: "Replace this page", path: "src/app/page.tsx" },
  { title: "Add your first feature", path: "src/features/<name>" },
  { title: "Add a ready-to-run module", path: "npx virastack add users" }
]

export const STACK: readonly StackItem[] = [
  { name: "Next.js", packageName: "next", icon: NextjsIcon },
  { name: "React", packageName: "react", icon: ReactIcon },
  { name: "TypeScript", packageName: "typescript", icon: TypescriptIcon },
  { name: "Tailwind CSS", packageName: "tailwindcss", icon: TailwindIcon },
  { name: "shadcn/ui", icon: ShadcnIcon },
  { name: "TanStack Query", packageName: "@tanstack/react-query", icon: TanstackIcon },
  { name: "Zustand", packageName: "zustand", icon: ZustandIcon },
  { name: "React Hook Form", packageName: "react-hook-form", icon: ReactHookFormIcon },
  { name: "Zod", packageName: "zod", icon: ZodIcon },
  { name: "nuqs", packageName: "nuqs", icon: NuqsIcon }
]

export const RESOURCE_LINKS = [
  { label: "Docs", href: "https://virastack.com/start/docs" },
  { label: "ViraStack AI", href: "https://virastack.com/ai" },
  { label: "Academy", href: "https://virastack.com/academy" },
  { label: "GitHub", href: "https://github.com/virastack/start" }
] as const
