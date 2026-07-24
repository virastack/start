import type { Metadata } from "next";

import { siteConfig } from "@/config/site.config";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["Next.js", "React", "TypeScript", "Tailwind CSS", "ViraStack", "Boilerplate"],
  authors: [{ name: "ViraStack", url: siteConfig.url }],
  creator: "ViraStack",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/logo.webp",
  },
  robots: {
    index: true,
    follow: true,
  },
};
