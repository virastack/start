"use client";

import { motion } from "framer-motion";

import { CartDemo } from "@/features/landing/CartDemo";
import {
  fadeInUp,
  featureCardClassName,
  staggerContainer,
  viewport,
} from "@/features/landing/motion";
import { ProjectFormDemo } from "@/features/landing/ProjectFormDemo";
import { UsersDemo } from "@/features/landing/UsersDemo";

export function Showcase() {
  return (
    <section id="showcase" className="mx-auto max-w-5xl px-6 pb-16">
      <motion.div
        className="mb-10 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerContainer}
      >
        <motion.h2
          variants={fadeInUp}
          className="text-3xl font-semibold tracking-tight text-balance"
        >
          Showcase
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mx-auto mt-3 max-w-2xl text-base text-balance text-muted-foreground"
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
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              Validated forms with{" "}
              <span className="font-semibold text-foreground">React Hook Form</span> and{" "}
              <span className="font-semibold text-foreground">Zod</span>.
            </p>
          </div>
          <ProjectFormDemo />
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className={`${featureCardClassName} flex flex-col justify-between`}
        >
          <div className="mb-4">
            <h4 className="text-base font-semibold text-foreground md:text-lg">Global State</h4>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              Shared client state managed with{" "}
              <span className="font-semibold text-foreground">Zustand</span>.
            </p>
          </div>
          <CartDemo />
        </motion.div>
      </motion.div>
    </section>
  );
}
