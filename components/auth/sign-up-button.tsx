"use client"

import { SignUpButton as ClerkSignUpButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export function SignUpButton() {
  return (
    <ClerkSignUpButton mode="modal">
      <Button variant="default" size="sm">
        Start Free
      </Button>
    </ClerkSignUpButton>
  )
}