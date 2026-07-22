"use client";

import { useCallback } from "react";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/ui";

export const ThemeSwitcher = () => {
  const { setTheme, theme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:flex-row">
      <Button variant="outline" size="icon" onClick={toggleTheme}>
        <SunIcon className="hidden [html.dark_&]:block" />
        <MoonIcon className="hidden [html.light_&]:block" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};
