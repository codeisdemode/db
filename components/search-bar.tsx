"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function SearchBar() {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", query)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Input
            type="text"
            placeholder="Help me get started with agent workflows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-16 py-6 text-base rounded-md border border-border bg-background/90 backdrop-blur-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/50"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </form>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs text-muted-foreground bg-muted/50">
        Ctrl K
      </div>
    </div>
  )
}

