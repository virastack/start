import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"

import { hasLocale, NextIntlClientProvider } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { NuqsAdapter } from "nuqs/adapters/next/app"

import { defaultMetadata } from "@/config/seo.config"

import { Providers } from "@/providers/Providers"

import { routing } from "@/i18n/routing"

import "@/styles/tailwind.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = defaultMetadata

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  return (
    <html
      lang={locale}
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col antialiased" suppressHydrationWarning>
        <NextIntlClientProvider>
          <NuqsAdapter>
            <Providers>{children}</Providers>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
