"use client"

import { useState } from "react"
import Link from "next/link"
import { CodeBlock } from "@/components/code-block"
import { 
  BookOpen, 
  Database, 
  Search, 
  Cloud, 
  Cpu, 
  Wifi, 
  Layers,
  ChevronRight
} from "lucide-react"

const coreConceptsCode = `import { Columnist, defineTable } from 'columnist-db-core'

// Columnar storage enables efficient queries and low memory usage
const schema = {
  users: defineTable()
    .column('id', 'string')
    .column('name', 'string')
    .column('email', 'string')
    .column('created_at', 'date')
    .primaryKey('id')
    .searchable('name', 'email')
    .indexes('created_at')
    .build(),
    
  posts: defineTable()
    .column('id', 'string')
    .column('user_id', 'string')
    .column('title', 'string')
    .column('content', 'string')
    .column('published', 'boolean')
    .primaryKey('id')
    .searchable('title', 'content')
    .indexes('user_id', 'published')
    .build()
}

// Each column is stored separately for optimal performance`

const searchExampleCode = `// Full-text search with relevance scoring
const results = await db.search("introduction to AI", {
  limit: 10,
  table: 'posts',
  filters: { published: true }
})

// Vector search for semantic similarity
const similarPosts = await db.vectorSearch(
  "machine learning concepts", 
  { table: 'posts', limit: 5 }
)

// Hybrid search combining both approaches
const hybridResults = await db.hybridSearch(
  "AI ethics discussion",
  { 
    table: 'posts',
    vectorWeight: 0.7,
    textWeight: 0.3,
    limit: 10
  }
)`

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState("core-concepts")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <nav className="sticky top-20 space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Core Concepts
          </h3>
          
          {[
            { id: "core-concepts", label: "Core Concepts", icon: Database },
            { id: "search", label: "Search & Query", icon: Search },
            { id: "sync", label: "Synchronization", icon: Cloud },
            { id: "performance", label: "Performance", icon: Cpu },
            { id: "offline", label: "Offline-First", icon: Wifi },
            { id: "architecture", label: "Architecture", icon: Layers }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center w-full px-3 py-2 text-left rounded-md text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-6">Documentation</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive guides and references for using Columnist, the client-side 
            columnar database with AI integration and ultra-low memory usage.
          </p>
        </div>

        {/* Core Concepts */}
        {activeSection === "core-concepts" && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Core Concepts</h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="mb-6">
                Columnist is built around several key concepts that enable its performance 
                and flexibility. Understanding these will help you make the most of the database.
              </p>

              <h3 className="text-xl font-semibold mb-4">Columnar Storage</h3>
              <p className="mb-4">
                Unlike traditional row-based databases, Columnist stores data by column rather than by row. 
                This enables:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Faster queries on specific columns</li>
                <li>Better compression ratios</li>
                <li>Lower memory usage (~48 bytes per record)</li>
                <li>Efficient analytical operations</li>
              </ul>

              <CodeBlock code={coreConceptsCode} language="typescript" />

              <h3 className="text-xl font-semibold mt-8 mb-4">Schema Definition</h3>
              <p className="mb-4">
                Columnist uses a fluent builder API for schema definition, providing:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Type safety with TypeScript integration</li>
                <li>Automatic validation with Zod schemas</li>
                <li>Indexing and search configuration</li>
                <li>Primary key and relationship definition</li>
              </ul>
            </div>
          </section>
        )}

        {/* Search & Query */}
        {activeSection === "search" && (
          <section>
            <h2 className="text-2xl font-semibold mb-6">Search & Query</h2>
            
            <div className="prose prose-lg max-w-none">
              <p className="mb-6">
                Columnist provides multiple search capabilities to find data efficiently:
              </p>

              <h3 className="text-xl font-semibold mb-4">Full-Text Search</h3>
              <p className="mb-4">
                Traditional keyword search with TF-IDF relevance scoring and support for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Boolean operators (AND, OR, NOT)</li>
                <li>Phrase matching with quotes</li>
                <li>Field-specific searching</li>
                <li>Relevance scoring and ranking</li>
              </ul>

              <h3 className="text-xl font-semibold mb-4">Vector Search</h3>
              <p className="mb-4">
                Semantic search using vector embeddings for meaning-based retrieval:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6">
                <li>Cosine similarity, dot product, and Euclidean distance</li>
                <li>Custom embedding function support</li>
                <li>Hybrid search with text and vector combined</li>
                <li>AI-powered semantic understanding</li>
              </ul>

              <CodeBlock code={searchExampleCode} language="typescript" />
            </div>
          </section>
        )}

        {/* Additional sections would go here for sync, performance, etc. */}
        
        <div className="bg-primary/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-primary" />
            Continue Learning
          </h3>
          <p className="text-sm mb-4">
            Explore these resources to deepen your understanding:
          </p>
          <div className="space-y-2">
            <Link href="/docs/api" className="flex items-center text-sm text-primary hover:underline">
              <ChevronRight className="h-4 w-4 mr-1" />
              API Reference
            </Link>
            <Link href="/docs/mcp" className="flex items-center text-sm text-primary hover:underline">
              <ChevronRight className="h-4 w-4 mr-1" />
              MCP Integration
            </Link>
            <Link href="/docs/examples" className="flex items-center text-sm text-primary hover:underline">
              <ChevronRight className="h-4 w-4 mr-1" />
              Examples & Tutorials
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}