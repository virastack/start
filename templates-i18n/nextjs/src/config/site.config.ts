import type { SiteConfig } from "@/types/site-config.types"
import { env } from "@/env"

// FIXME: replace with your own site metadata, and public/og.png and public/logo.* with your images.
export const siteConfig: SiteConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description:
    "Next.js boilerplate built for scalable UI/UX, clean architecture, and agent-ready developer experience.",
  shortName: "ViraStack Start",
  url: env.NEXT_PUBLIC_APP_URL,
  apiUrl: env.NEXT_PUBLIC_API_URL,
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.png`,
  links: {
    github: "https://github.com/virastack/start",
    twitter: "https://x.com/virastack"
  }
}
