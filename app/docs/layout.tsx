"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Code, 
  FileText, 
  Brain, 
  Zap, 
  GitPullRequest,
  Home
} from "lucide-react"

interface DocsLayoutProps {
  children: React.ReactNode
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  const [activeTab, setActiveTab] = useState("welcome")

  return (
    <div className="min-h-screen bg-background">
      {/* Header with tabs */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Columnist Documentation</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                Back to Home
              </Link>
            </div>
          </div>
          
          {/* Tab navigation */}
          <div className="border-t border-border">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full justify-start h-12 rounded-none border-b-0 bg-transparent p-0">
                <TabsTrigger 
                  value="welcome" 
                  className="flex items-center space-x-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                  asChild
                >
                  <Link href="/docs">
                    <Zap className="h-4 w-4" />
                    <span>Welcome</span>
                  </Link>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="documentation" 
                  className="flex items-center space-x-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                  asChild
                >
                  <Link href="/docs/documentation">
                    <BookOpen className="h-4 w-4" />
                    <span>Documentation</span>
                  </Link>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="api" 
                  className="flex items-center space-x-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                  asChild
                >
                  <Link href="/docs/api">
                    <Code className="h-4 w-4" />
                    <span>API Reference</span>
                  </Link>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="mcp" 
                  className="flex items-center space-x-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                  asChild
                >
                  <Link href="/docs/mcp">
                    <Brain className="h-4 w-4" />
                    <span>MCP</span>
                  </Link>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="examples" 
                  className="flex items-center space-x-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                  asChild
                >
                  <Link href="/docs/examples">
                    <FileText className="h-4 w-4" />
                    <span>Examples</span>
                  </Link>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="changelog" 
                  className="flex items-center space-x-2 px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none"
                  asChild
                >
                  <Link href="/docs/changelog">
                    <GitPullRequest className="h-4 w-4" />
                    <span>Changelog</span>
                  </Link>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}