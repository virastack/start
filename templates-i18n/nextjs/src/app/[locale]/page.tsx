import { setRequestLocale } from "next-intl/server"

import { LandingPage } from "@/features/landing/components/LandingPage"

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LandingPage />
}
