import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { NuqsAdapter } from "nuqs/adapters/next/app"

import { defaultMetadata } from "@/config/seo.config"

import { Providers } from "@/providers/Providers"

import { SiteHeader } from "@/components/shared/SiteHeader"

import "@/styles/tailwind.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = defaultMetadata

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col antialiased" suppressHydrationWarning>
        <NuqsAdapter>
          <Providers>
            <SiteHeader />
            {children}
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  )
}
