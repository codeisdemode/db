"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, Github } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserButton } from "@/components/auth/user-button"
import { SignInButton } from "@/components/auth/sign-in-button"
import { SignUpButton } from "@/components/auth/sign-up-button"
import { SignedIn, SignedOut } from "@clerk/nextjs"

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="w-full border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Columnist.live
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link href="/test" className="px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted">
              Demo
            </Link>
            <Link href="/devtools" className="px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted">
              Devtools
            </Link>
            <Link href="/docs" className="px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted">
              Documentation
            </Link>
            <Link href="/examples" className="px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted">
              Examples
            </Link>
            <Link href="/pricing" className="px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted">
              Pricing
            </Link>
            <Link href="/blog" className="px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted">
              Blog
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            <Link href="https://github.com/columnist-io" className="text-foreground hover:text-primary">
              <Github className="h-5 w-5" />
            </Link>
            <SignedOut>
              <SignInButton />
              <SignUpButton />
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-t border-border shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/test" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
              Demo
            </Link>
            <Link href="/devtools" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
              Devtools
            </Link>
            <Link href="/docs" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
              Documentation
            </Link>
            <Link href="/examples" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
              Examples
            </Link>
            <Link href="/pricing" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/blog" className="block px-3 py-3 rounded-md text-base font-medium hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
              Blog
            </Link>
            <div className="pt-4 pb-2 border-t border-border">
              <div className="flex items-center justify-center px-3 mb-4">
                <ThemeToggle />
              </div>
              <div className="flex flex-col items-center px-3 gap-3">
                <SignedOut>
                  <div className="w-full">
                    <SignInButton onClick={() => setIsMenuOpen(false)} />
                  </div>
                  <div className="w-full">
                    <SignUpButton onClick={() => setIsMenuOpen(false)} />
                  </div>
                </SignedOut>
                <SignedIn>
                  <div className="w-full flex justify-center">
                    <UserButton />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

