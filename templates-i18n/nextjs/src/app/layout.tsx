import type { ReactNode } from "react"

// Required by Next.js when `app/not-found.tsx` exists.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children
}
