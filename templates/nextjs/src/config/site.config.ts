import type { SiteConfig } from "@/types/site-config.types";
import { DEFAULT_LOCALE } from "@/constants/i18n.constants";
import { env } from "@/env";

// FIXME: Update site branding, default locale, theme color, social links, languages and OG image
export const siteConfig: SiteConfig = {
  name: "ViraStack - Next.js Boilerplate",
  description: "Production-ready Next.js 16+ starter built with Tailwind CSS 4 and TypeScript.",
  url: env.NEXT_PUBLIC_SITE_URL,
  author: "Ömer Gülçiçek",
  locale: DEFAULT_LOCALE,
  themeColor: "#ffffff",
  keywords: ["nextjs", "typescript", "tailwindcss", "boilerplate", "starter"],
  social: {
    twitter: "@omergulcicek",
    github: "omergulcicek",
    linkedin: "omergulcicek"
  },
  ogImage: "/og.jpg",
  languages: {
    tr: "/tr",
    en: "/en",
    "x-default": "/en"
  }
} as const;
