import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { NavBar } from "@/components/nav-bar"
import { ThemeProvider } from "@/components/theme-provider"
import { AutoThemeProvider } from "@/components/auto-theme-provider"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Columnist.live - Lightning-Fast, Semantic-Ready Client-Side Database for Web Apps",
  description:
    "A columnar database for modern web apps—store, query, and sync data instantly with ultra-low memory usage and AI-powered search.",
  generator: 'v0.app'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AutoThemeProvider />
            <div className="min-h-screen flex flex-col">
              <NavBar />
              <main className="flex-1 w-full">
                {children}
              </main>
            </div>
            <footer className="w-full border-t border-border py-8 bg-background">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                  <div>
                    <h3 className="font-bold mb-4">Columnist.live</h3>
                    <p className="text-sm text-muted-foreground">
                      Client-Side Data, Redefined.
                      <br />A lean, fast, semantic database for the modern web.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4">Product</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/docs" className="text-muted-foreground hover:text-foreground">
                          Documentation
                        </a>
                      </li>
                      <li>
                        <a href="/examples" className="text-muted-foreground hover:text-foreground">
                          Examples
                        </a>
                      </li>
                      <li>
                        <a href="/pricing" className="text-muted-foreground hover:text-foreground">
                          Pricing
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4">Resources</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/blog" className="text-muted-foreground hover:text-foreground">
                          Blog
                        </a>
                      </li>
                      <li>
                        <a href="/community" className="text-muted-foreground hover:text-foreground">
                          Community
                        </a>
                      </li>
                      <li>
                        <a href="/support" className="text-muted-foreground hover:text-foreground">
                          Support
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold mb-4">Company</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/about" className="text-muted-foreground hover:text-foreground">
                          About
                        </a>
                      </li>
                      <li>
                        <a href="/careers" className="text-muted-foreground hover:text-foreground">
                          Careers
                        </a>
                      </li>
                      <li>
                        <a href="/contact" className="text-muted-foreground hover:text-foreground">
                          Contact
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Columnist.live. All rights reserved.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
                    <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                      Terms
                    </a>
                    <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                      Privacy
                    </a>
                    <a href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                      Cookies
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}