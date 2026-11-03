import type { SiteConfig } from "@/types/site-config.types"
import { env } from "@/env"

// FIXME: replace with your own site metadata, and public/og.png and public/logo.* with your images.
export const siteConfig: SiteConfig = {
  name: env.VITE_APP_NAME,
  description:
    "TanStack Start boilerplate built for scalable UI/UX, clean architecture, and agent-ready developer experience.",
  shortName: "ViraStack Start",
  url: env.VITE_APP_URL,
  apiUrl: env.VITE_API_URL,
  ogImage: `${env.VITE_APP_URL}/og.png`,
  links: {
    github: "https://github.com/virastack/start",
    twitter: "https://x.com/virastack"
  }
}
