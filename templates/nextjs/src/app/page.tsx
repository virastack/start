import type { Metadata } from "next"

import { HomePage } from "@/features/home/components/HomePage"

export const metadata: Metadata = {
  alternates: { canonical: "/" }
}

export default function Page() {
  return <HomePage />
}
