"use client";

import { BotIcon, FileCode2Icon } from "lucide-react";

import { NextjsIcon, ShadcnIcon, TanstackIcon, TypescriptIcon } from "@/features/landing/icons";
import { CartDemo } from "@/features/landing/CartDemo";
import { ProjectFormDemo } from "@/features/landing/ProjectFormDemo";
import { UsersDemo } from "@/features/landing/UsersDemo";

const FEATURES = [
  {
    title: "Next.js App Router",
    description: "Leverage React Server Components, streaming, and nested layouts for unmatched performance.",
    icon: <NextjsIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "Type-Safe Everything",
    description: "End-to-end type safety from environment variables to API responses with TypeScript and Zod.",
    icon: <TypescriptIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "TanStack Query",
    description: "Server-state caching and synchronization, plus URL state via nuqs - all wired and ready to use.",
    icon: <TanstackIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "Tailwind & shadcn/ui",
    description: "shadcn/ui patterns on Base UI primitives - Tailwind CSS v4, accessible, and fully yours to own.",
    icon: <ShadcnIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "React Hook Form",
    description: "Performant, flexible, and extensible forms with easy-to-use validation integration.",
    icon: <FileCode2Icon className="h-5 w-5 text-primary" />,
  },
  {
    title: "ViraStack AI",
    description: "Pre-configured agent context - coding rules, design skills, and AGENTS.md so any AI assistant matches this codebase.",
    icon: <BotIcon className="h-5 w-5 text-primary" />,
  },
];

const featureCardClassName =
  "group flex flex-col gap-3 p-4 md:p-6 transition-[border-color,box-shadow] duration-150 ease-out rounded-2xl border border-border ring-1 ring-border ring-offset-4 ring-offset-background hover:border-foreground/10 hover:ring-foreground/8 bg-card";

export function Playground() {
  return (
    <section id="playground" className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Features</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground text-balance">
          Everything you need to build a modern web application, already configured with the best practices.
        </p>
      </div>

      <div className="mb-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            className={featureCardClassName}
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              {feature.icon}
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-balance text-base font-semibold md:text-lg text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-pretty text-sm leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-10 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Showcase</h2>
        <p className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto text-balance">
          Experience the seamless integration of UI components and state management.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className={featureCardClassName}>
          <UsersDemo />
        </div>

        <div className="flex flex-col gap-6">
          <div className={featureCardClassName}>
            <div className="mb-4">
              <h4 className="text-base font-semibold text-foreground md:text-lg">New Project</h4>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Validated forms with <span className="font-semibold text-foreground">React Hook Form</span> and{" "}
                <span className="font-semibold text-foreground">Zod</span>.
              </p>
            </div>
            <ProjectFormDemo />
          </div>

          <div className={`${featureCardClassName} flex-1 justify-between`}>
            <div className="mb-4">
              <h4 className="text-base font-semibold text-foreground md:text-lg">Global State</h4>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                Shared client state managed with <span className="font-semibold text-foreground">Zustand</span>.
              </p>
            </div>
            <CartDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
