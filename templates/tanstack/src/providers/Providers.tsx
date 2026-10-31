import { Toaster } from "sonner"

import { ThemeProvider } from "@/providers/ThemeProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      {children}
      <Toaster richColors position="bottom-right" closeButton />
    </ThemeProvider>
  )
}
