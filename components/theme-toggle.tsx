"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const current = theme === "system" ? resolvedTheme : theme
  const next = current === "dark" ? "light" : "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Перемкнути тему"
      onClick={() => setTheme(next)}
    >
      {current === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

