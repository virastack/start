import type { Metadata } from "next"

import { setRequestLocale } from "next-intl/server"

import { getPageAlternates } from "@/config/seo.config"

import { HomePage } from "@/features/home/components/HomePage"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params

  return { alternates: getPageAlternates(locale, "/") }
}

export default async function Page({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)

  return <HomePage />
}
