"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList,
  CommandSeparator 
} from "@/components/ui/command"
import { 
  BookOpen, 
  Code, 
  FileText, 
  Brain, 
  Zap, 
  GitPullRequest,
  Search,
  Database,
  Cloud,
  Cpu
} from "lucide-react"

interface SearchResult {
  id: string
  title: string
  description: string
  url: string
  category: string
  icon: React.ComponentType<any>
}

const searchData: SearchResult[] = [
  // Welcome & Getting Started
  {
    id: "welcome",
    title: "Welcome",
    description: "Get started with Columnist",
    url: "/docs",
    category: "Getting Started",
    icon: Zap
  },
  {
    id: "installation",
    title: "Installation",
    description: "Installation guide and setup",
    url: "/docs",
    category: "Getting Started",
    icon: Zap
  },
  {
    id: "quickstart",
    title: "Quick Start",
    description: "5-minute setup guide",
    url: "/docs",
    category: "Getting Started",
    icon: Zap
  },

  // Documentation
  {
    id: "core-concepts",
    title: "Core Concepts",
    description: "Understanding columnar storage and schema",
    url: "/docs/documentation",
    category: "Documentation",
    icon: Database
  },
  {
    id: "search",
    title: "Search & Query",
    description: "Full-text, vector, and hybrid search",
    url: "/docs/documentation",
    category: "Documentation",
    icon: Search
  },
  {
    id: "sync",
    title: "Synchronization",
    description: "Cross-device sync and conflict resolution",
    url: "/docs/documentation",
    category: "Documentation",
    icon: Cloud
  },
  {
    id: "performance",
    title: "Performance",
    description: "Optimization and best practices",
    url: "/docs/documentation",
    category: "Documentation",
    icon: Cpu
  },

  // API Reference
  {
    id: "api-init",
    title: "Initialization API",
    description: "Database initialization methods",
    url: "/docs/api",
    category: "API Reference",
    icon: Code
  },
  {
    id: "api-crud",
    title: "CRUD Operations",
    description: "Create, read, update, delete methods",
    url: "/docs/api",
    category: "API Reference",
    icon: Code
  },
  {
    id: "api-search",
    title: "Search API",
    description: "Search and query methods",
    url: "/docs/api",
    category: "API Reference",
    icon: Code
  },
  {
    id: "api-sync",
    title: "Sync API",
    description: "Synchronization methods",
    url: "/docs/api",
    category: "API Reference",
    icon: Code
  },

  // MCP Integration
  {
    id: "mcp-setup",
    title: "MCP Setup",
    description: "Configure MCP server for AI integration",
    url: "/docs/mcp",
    category: "MCP Integration",
    icon: Brain
  },
  {
    id: "mcp-tools",
    title: "Custom Tools",
    description: "Create custom AI tools",
    url: "/docs/mcp",
    category: "MCP Integration",
    icon: Brain
  },
  {
    id: "mcp-chat",
    title: "Chat Integration",
    description: "AI-powered chat applications",
    url: "/docs/mcp",
    category: "MCP Integration",
    icon: Brain
  },

  // Examples
  {
    id: "examples-chat",
    title: "Chat Application",
    description: "Real-time chat app example",
    url: "/docs/examples",
    category: "Examples",
    icon: FileText
  },
  {
    id: "examples-knowledge",
    title: "Knowledge Base",
    description: "Semantic search knowledge base",
    url: "/docs/examples",
    category: "Examples",
    icon: FileText
  },
  {
    id: "examples-ecommerce",
    title: "E-commerce",
    description: "Product catalog with search",
    url: "/docs/examples",
    category: "Examples",
    icon: FileText
  },

  // Changelog
  {
    id: "changelog",
    title: "Changelog",
    description: "Version history and updates",
    url: "/docs/changelog",
    category: "Changelog",
    icon: GitPullRequest
  }
]

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  const filterResults = (search: string) => {
    if (!search) return searchData
    
    const searchLower = search.toLowerCase()
    return searchData.filter(item => 
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    )
  }

  const [searchValue, setSearchValue] = React.useState("")
  const filteredResults = filterResults(searchValue)

  const categories = React.useMemo(() => {
    const cats = new Set(filteredResults.map(item => item.category))
    return Array.from(cats)
  }, [filteredResults])

  return (
    <>
      {/* Search trigger - can be placed in navbar */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center w-full max-w-sm px-3 py-2 text-sm text-muted-foreground rounded-md border border-border bg-background/80 backdrop-blur-sm hover:bg-muted/50 transition-colors"
      >
        <Search className="h-4 w-4 mr-2" />
        <span className="flex-1 text-left">Search documentation...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search documentation..." 
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {categories.map((category) => (
            <CommandGroup key={category} heading={category}>
              {filteredResults
                .filter(item => item.category === category)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.title} ${item.description} ${item.category}`}
                      onSelect={() => handleSelect(item.url)}
                      className="flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          ))}

          <CommandSeparator />
          
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleSelect("/docs")}>
              <Zap className="h-4 w-4 mr-2" />
              Go to Welcome
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/docs/api")}>
              <Code className="h-4 w-4 mr-2" />
              API Reference
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/docs/mcp")}>
              <Brain className="h-4 w-4 mr-2" />
              MCP Integration
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}