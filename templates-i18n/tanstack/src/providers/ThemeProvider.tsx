import { createContext, useContext, useEffect, useSyncExternalStore } from "react"

import { ScriptOnce } from "@tanstack/react-router"

type Theme = "dark" | "light" | "system"

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

interface ThemeProviderState {
  theme: Theme
  resolvedTheme: "dark" | "light"
  setTheme: (theme: Theme) => void
}

function getThemeScript(storageKey: string, defaultTheme: Theme) {
  const key = JSON.stringify(storageKey)
  const fallback = JSON.stringify(defaultTheme)

  return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'&&t!=='system'){t=${fallback}}var d=matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.add(r);e.style.colorScheme=r}catch(e){}})();`
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

function readTheme(storageKey: string, defaultTheme: Theme): Theme {
  const stored = localStorage.getItem(storageKey)
  return stored === "light" || stored === "dark" || stored === "system" ? stored : defaultTheme
}

const THEME_CHANGE_EVENT = "virastack:theme-change"
const DARK_QUERY = "(prefers-color-scheme: dark)"

function subscribeToTheme(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(THEME_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(THEME_CHANGE_EVENT, onChange)
  }
}

function subscribeToSystemTheme(onChange: () => void) {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

const prefersDark = () => window.matchMedia(DARK_QUERY).matches

function resolve(theme: Theme, systemDark: boolean) {
  if (theme !== "system") return theme
  return systemDark ? "dark" : "light"
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme"
}: ThemeProviderProps) {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    () => readTheme(storageKey, defaultTheme),
    () => defaultTheme
  )
  const systemDark = useSyncExternalStore(subscribeToSystemTheme, prefersDark, () => false)
  const resolvedTheme = resolve(theme, systemDark)

  useEffect(() => {
    // Read the real values: on hydration `resolvedTheme` still holds the server snapshot.
    const current = resolve(readTheme(storageKey, defaultTheme), prefersDark())
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(current)
    root.style.colorScheme = current
  }, [resolvedTheme, storageKey, defaultTheme])

  const setTheme = (next: Theme) => {
    localStorage.setItem(storageKey, next)
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT))
  }

  return (
    <ThemeProviderContext value={{ theme, resolvedTheme, setTheme }}>
      <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
      {children}
    </ThemeProviderContext>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
