"use client";

import { BotIcon, FileCode2Icon } from "lucide-react";
import { motion } from "framer-motion";

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
] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const viewport = { once: true, margin: "-80px" as const };

const featureCardClassName =
  "group flex flex-col gap-3 p-4 md:p-6 transition-[border-color,box-shadow] duration-150 ease-out rounded-2xl border border-border ring-1 ring-border ring-offset-4 ring-offset-background hover:border-foreground/10 hover:ring-foreground/8 bg-card";

export function Playground() {
  return (
    <section id="playground" className="mx-auto max-w-5xl px-6 py-16">
      <motion.div
        className="mb-16 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeInUp} className="text-3xl font-semibold tracking-tight text-balance">
          Features
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-3 max-w-xl text-base text-muted-foreground text-balance"
        >
          Everything you need to build a modern web application, already configured with the best practices.
        </motion.p>
      </motion.div>

      <motion.div
        className="mb-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
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
              <h3 className="text-balance text-base font-semibold md:text-lg text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-pretty text-sm leading-relaxed">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mb-10 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer}
      >
        <motion.h2 variants={fadeInUp} className="text-3xl font-semibold tracking-tight text-balance">
          Showcase
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mt-3 text-base text-muted-foreground max-w-2xl mx-auto text-balance"
        >
          Experience the seamless integration of UI components and state management.
        </motion.p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-2"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp} className={`${featureCardClassName} lg:row-span-2`}>
          <UsersDemo />
        </motion.div>

        <motion.div variants={fadeInUp} className={featureCardClassName}>
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground md:text-lg">New Project</h4>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Validated forms with <span className="font-semibold text-foreground">React Hook Form</span> and{" "}
              <span className="font-semibold text-foreground">Zod</span>.
            </p>
          </div>
          <ProjectFormDemo />
        </motion.div>

        <motion.div variants={fadeInUp} className={`${featureCardClassName} flex flex-col justify-between`}>
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground md:text-lg">Global State</h4>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Shared client state managed with <span className="font-semibold text-foreground">Zustand</span>.
            </p>
          </div>
          <CartDemo />
        </motion.div>
      </motion.div>
    </section>
  );
}
