"use client"

import { UserButton as ClerkUserButton } from "@clerk/nextjs"

export function UserButton() {
  return (
    <ClerkUserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "w-8 h-8",
          userButtonPopoverCard: "bg-background border-border",
          userButtonPopoverActionButton: "hover:bg-muted"
        }
      }}
    />
  )
}