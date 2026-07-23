import type { Variants } from "framer-motion";

export const fadeInUp = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} satisfies Variants;

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
} satisfies Variants;

export const viewport = { once: true, margin: "-80px" as const };

export const featureCardClassName =
  "group flex flex-col gap-3 p-4 md:p-6 transition-[border-color,box-shadow] duration-150 ease-out rounded-2xl border border-border ring-1 ring-border ring-offset-4 ring-offset-background hover:border-foreground/10 hover:ring-foreground/8 bg-card";
