import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { GoogleAnalytics } from "@next/third-parties/google";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { seoConfig } from "@/config/seo.config";
import { siteConfig } from "@/config/site.config";
import { env } from "@/env";

import { routing } from "@/i18n/routing";

import { Footer, Header } from "@/components/layout";
import { Toaster } from "@/ui";
import { Providers } from "@/providers";

import "@/tailwind";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return {
    ...seoConfig,
    alternates: {
      canonical: `/${locale}`,
      languages: siteConfig.languages
    }
  } satisfies Metadata;
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen w-full flex-col antialiased`}
      >
        <Providers messages={messages} locale={locale}>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster richColors />
          <Footer />
        </Providers>

        {env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />}
      </body>
    </html>
  );
}
