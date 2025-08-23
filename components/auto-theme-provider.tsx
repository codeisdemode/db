"use client"

import { useAutoTheme } from "@/hooks/use-auto-theme"

export function AutoThemeProvider() {
  const { autoThemeEnabled } = useAutoTheme()
  
  // This component doesn't render anything, just enables the auto theme functionality
  return null
}