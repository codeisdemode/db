"use client"

import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"
import { Moon, Sun, Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { useAutoTheme } from "@/hooks/use-auto-theme"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { autoThemeEnabled, setAutoThemeEnabled } = useAutoTheme()
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4" />
        <Switch disabled />
        <Moon className="h-4 w-4" />
      </div>
    )
  }

  const isDark = theme === "dark"

  const handleThemeChange = (checked: boolean) => {
    // When user manually changes theme, disable auto theme
    setAutoThemeEnabled(false)
    setTheme(checked ? "dark" : "light")
  }

  const toggleAutoTheme = () => {
    setAutoThemeEnabled(!autoThemeEnabled)
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4" />
        <Switch
          checked={isDark}
          onCheckedChange={handleThemeChange}
          aria-label="Toggle theme"
          disabled={autoThemeEnabled}
        />
        <Moon className="h-4 w-4" />
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 hover:bg-muted rounded"
          aria-label="Theme settings"
        >
          <Settings className="h-3 w-3" />
        </button>
      </div>
      
      {showSettings && (
        <div className="flex items-center space-x-2 text-xs">
          <span>Auto theme:</span>
          <Switch
            checked={autoThemeEnabled}
            onCheckedChange={toggleAutoTheme}
            aria-label="Toggle auto theme"
            className="scale-75"
          />
        </div>
      )}
    </div>
  )
}