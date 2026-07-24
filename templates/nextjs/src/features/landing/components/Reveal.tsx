"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

import { fadeInUp, staggerContainer, viewport } from "@/features/landing/helpers";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Mount animation delay in seconds (hero-style). Ignored when `mode="view"`. */
  delay?: number;
  /** `mount` = animate on load; `view` = animate when scrolled into view. */
  mode?: "mount" | "view";
  /** Initial Y offset for mount animations. */
  y?: number;
  /**
   * When false (mount mode), only translate — keep opacity at 1 so LCP text
   * is painted on first frame. Default true.
   */
  fadeOpacity?: boolean;
};

/**
 * Client-only motion shell. Keep copy/markup in Server Components and wrap
 * animated regions with this so the page stays SSR-first.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  mode = "view",
  y = 12,
  fadeOpacity = true,
}: RevealProps) {
  if (mode === "mount") {
    return (
      <motion.div
        className={className}
        initial={fadeOpacity ? { opacity: 0, y } : { y }}
        animate={fadeOpacity ? { opacity: 1, y: 0 } : { y: 0 }}
        transition={{ duration: 0.45, delay, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeInUp}>
      {children}
    </motion.div>
  );
}
