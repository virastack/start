"use client";

import { BotIcon, FileCode2Icon } from "lucide-react";
import { motion } from "framer-motion";

import { NextjsIcon, ShadcnIcon, TanstackIcon, TypescriptIcon } from "@/features/landing/icons";
import {
  fadeInUp,
  featureCardClassName,
  staggerContainer,
  viewport,
} from "@/features/landing/motion";

const FEATURES = [
  {
    title: "Next.js App Router",
    description:
      "Leverage React Server Components, streaming, and nested layouts for unmatched performance.",
    icon: <NextjsIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "Type-Safe Everything",
    description:
      "End-to-end type safety from environment variables to API responses with TypeScript and Zod.",
    icon: <TypescriptIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "TanStack Query",
    description:
      "Server-state caching and synchronization, plus URL state via nuqs - all wired and ready to use.",
    icon: <TanstackIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "Tailwind & shadcn/ui",
    description:
      "shadcn/ui patterns on Base UI primitives - Tailwind CSS v4, accessible, and fully yours to own.",
    icon: <ShadcnIcon className="h-5 w-5 text-primary" />,
  },
  {
    title: "React Hook Form",
    description:
      "Performant, flexible, and extensible forms with easy-to-use validation integration.",
    icon: <FileCode2Icon className="h-5 w-5 text-primary" />,
  },
  {
    title: "ViraStack AI",
    description:
      "Pre-configured agent context - coding rules, design skills, and AGENTS.md so any AI assistant matches this codebase.",
    icon: <BotIcon className="h-5 w-5 text-primary" />,
  },
] as const;

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-16">
      <motion.div
        className="mb-16 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl font-semibold tracking-tight text-balance"
        >
          Features
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-3 max-w-xl text-base text-balance text-muted-foreground"
        >
          Everything you need to build a modern web application, already configured with the best
          practices.
        </motion.p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer}
      >
        {FEATURES.map((feature) => (
          <motion.div key={feature.title} variants={fadeInUp} className={featureCardClassName}>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-200 ease-out group-hover:scale-105">
              {feature.icon}
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-balance text-foreground md:text-lg">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
