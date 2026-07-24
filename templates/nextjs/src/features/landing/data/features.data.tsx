import { BotIcon } from "lucide-react";

import {
  NextjsIcon,
  ReactHookFormIcon,
  TailwindIcon,
  TanstackIcon,
  TypescriptIcon,
} from "@/features/landing/icons";

export const FEATURES = [
  {
    title: "Next.js App Router",
    description:
      "Leverage React Server Components, streaming, and nested layouts for unmatched performance.",
    icon: <NextjsIcon className="size-7 text-primary" />,
  },
  {
    title: "Type-Safe Everything",
    description:
      "End-to-end type safety from environment variables to API responses with TypeScript and Zod.",
    icon: <TypescriptIcon className="size-7 text-primary" />,
  },
  {
    title: "TanStack Query",
    description:
      "Server-state caching and synchronization, plus URL state via nuqs - all wired and ready to use.",
    icon: <TanstackIcon className="size-7 text-primary" />,
  },
  {
    title: "Tailwind & shadcn/ui",
    description:
      "shadcn/ui patterns on Base UI primitives - Tailwind CSS v4, accessible, and fully yours to own.",
    icon: <TailwindIcon className="size-7 text-primary" />,
  },
  {
    title: "React Hook Form",
    description:
      "Performant, flexible, and extensible forms with easy-to-use validation integration.",
    icon: <ReactHookFormIcon className="size-7 text-primary" />,
  },
  {
    title: "ViraStack AI",
    description:
      "Pre-configured agent context - coding rules, design skills, and AGENTS.md so any AI assistant matches this codebase.",
    icon: <BotIcon className="size-7 text-primary" />,
  },
] as const;
