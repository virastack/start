"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      value={{ light: "light", dark: "dark" }}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
