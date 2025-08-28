"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/code-block"
import { 
  BookOpen, 
  Code, 
  Database, 
  Search, 
  Zap, 
  Cloud, 
  Cpu, 
  Wifi, 
  Brain, 
  Layers,
  ArrowRight,
  ChevronRight,
  ExternalLink
} from "lucide-react"

const installationCode = `npm install @columnist/db
# or
yarn add @columnist/db
# or
pnpm add @columnist/db`

const basicUsageCode = `import { Columnist, defineTable } from '@columnist/db'

// Define your schema
const schema = {
  messages: defineTable()
    .column('id', 'number')
    .column('user_id', 'number')
    .column('message', 'string')
    .column('timestamp', 'date')
    .primaryKey('id')
    .searchable('message')
    .indexes('user_id', 'timestamp')
    .build(),
  users: defineTable()
    .column('id', 'number')
    .column('name', 'string')
    .column('email', 'string')
    .primaryKey('id')
    .searchable('name', 'email')
    .build()
}

// Initialize the database
const db = await Columnist.init('my-app', { schema })
await db.load()`

const searchExampleCode = `// Semantic search across all tables
const results = await db.search("AI ethics discussion", { 
  limit: 10,
  user_id: 42,
  timeRange: ["2025-01-01", "2025-12-31"]
})

console.log(results)
// [
//   { id: 123, user_id: 42, message: "AI ethics matter for future...", score: 0.92 },
//   { id: 456, user_id: 42, message: "Ethical considerations in AI...", score: 0.87 }
// ]`

const syncExampleCode = `import { FirebaseSyncAdapter } from '@columnist/db/sync'

// Sync with Firebase
await db.registerSyncAdapter('firebase', 'firebase', {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id'
})

await db.startSync('firebase')`

const mcpExampleCode = `import { ColumnistMCPServer } from 'columnist-db-core/mcp'

// Configure MCP server with comprehensive options
const mcpServer = new ColumnistMCPServer(db, {
  port: 3001,
  auth: {
    type: 'jwt',
    secret: process.env.MCP_JWT_SECRET,
    expiresIn: '1h'
  },
  security: {
    enableRateLimit: true,
    maxRequestsPerMinute: 100,
    allowedOrigins: ['http://localhost:3000'],
    enableCors: true
  },
  tools: ['search', 'query', 'vector_search', 'analytics'],
  logging: {
    level: 'info',
    enableAccessLog: true
  }
})

await mcpServer.start()
console.log('MCP server ready for AI integration')

// Claude can now interact with your database via MCP protocol`

const reactHookExampleCode = `import { useColumnist } from 'columnist-db-hooks'

function ChatMessages({ chatId }) {
  const { data: messages, loading, error } = useColumnist(
    (db) => db.search("recent messages", { chat_id: chatId, limit: 50 }),
    [chatId]
  )

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {messages.map(message => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
  )
}`

const chatAppMCPCode = `import { Columnist, defineTable } from 'columnist-db-core'
import { ColumnistMCPServer } from 'columnist-db-core/mcp'

// Define chat application schema
const chatSchema = {
  messages: defineTable()
    .column('id', 'string')
    .column('chat_id', 'string') 
    .column('user_id', 'string')
    .column('content', 'string')
    .column('timestamp', 'date')
    .column('metadata', 'object')
    .primaryKey('id')
    .searchable('content')
    .indexes('chat_id', 'user_id', 'timestamp')
    .build(),
  
  chats: defineTable()
    .column('id', 'string')
    .column('title', 'string')
    .column('participants', 'array')
    .column('created_at', 'date')
    .column('last_activity', 'date')
    .primaryKey('id')
    .searchable('title')
    .indexes('participants', 'last_activity')
    .build(),
    
  users: defineTable()
    .column('id', 'string')
    .column('name', 'string')
    .column('avatar', 'string')
    .column('status', 'string')
    .primaryKey('id')
    .searchable('name')
    .build()
}

// Initialize database
const db = await Columnist.init('chat-app', { schema: chatSchema })
await db.load()

// Start MCP server for AI assistant integration
const mcpServer = new ColumnistMCPServer(db, {
  port: 3001,
  auth: {
    type: 'jwt',
    secret: process.env.MCP_JWT_SECRET
  },
  security: {
    enableRateLimit: true,
    maxRequestsPerMinute: 200,
    allowedOrigins: ['http://localhost:3000']
  },
  tools: ['search', 'query', 'vector_search', 'analytics'],
  customTools: {
    // AI can search chat history semantically
    searchChatHistory: {
      description: 'Search through chat messages using semantic search',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          chatId: { type: 'string' },
          limit: { type: 'number', default: 10 }
        }
      },
      handler: async ({ query, chatId, limit = 10 }) => {
        return await db.search(query, { 
          chat_id: chatId, 
          limit,
          table: 'messages'
        })
      }
    },
    
    // AI can analyze chat patterns
    getChatInsights: {
      description: 'Get insights about chat activity and patterns',
      inputSchema: {
        type: 'object',
        properties: {
          chatId: { type: 'string' },
          timeRange: { type: 'string', default: '7d' }
        }
      },
      handler: async ({ chatId, timeRange }) => {
        const messages = await db.find('messages', { chat_id: chatId })
        // Return activity patterns, most active users, etc.
        return {
          messageCount: messages.length,
          activeUsers: [...new Set(messages.map(m => m.user_id))].length,
          peakHours: analyzeMessageTiming(messages)
        }
      }
    }
  }
})

await mcpServer.start()
console.log('Chat app MCP server ready - AI can now assist with chat analysis!')`

const apiReference = [
  {
    title: "Initialization",
    methods: [
      { name: "Columnist.init()", description: "Initialize database with schema" },
      { name: "db.load()", description: "Load data from persistence" }
    ]
  },
  {
    title: "CRUD Operations",
    methods: [
      { name: "db.insert()", description: "Insert new records" },
      { name: "db.update()", description: "Update existing records" },
      { name: "db.delete()", description: "Delete records" },
      { name: "db.find()", description: "Find records with filters" },
      { name: "db.getAll()", description: "Get all records from table" }
    ]
  },
  {
    title: "Search & Query",
    methods: [
      { name: "db.search()", description: "Semantic search across tables" },
      { name: "db.query()", description: "Advanced query builder" }
    ]
  },
  {
    title: "Sync & Persistence",
    methods: [
      { name: "db.registerSyncAdapter()", description: "Register sync adapter" },
      { name: "db.startSync()", description: "Start synchronization" },
      { name: "db.getSyncStatus()", description: "Get sync status" }
    ]
  },
  {
    title: "Utilities",
    methods: [
      { name: "db.getStats()", description: "Get database statistics" },
      { name: "db.subscribe()", description: "Subscribe to changes" },
      { name: "db.transaction()", description: "Run transactional operations" }
    ]
  },
  {
    title: "MCP Integration",
    methods: [
      { name: "ColumnistMCPServer()", description: "Initialize MCP server for AI integration" },
      { name: "mcpServer.start()", description: "Start the MCP server" },
      { name: "mcpServer.stop()", description: "Stop the MCP server" },
      { name: "mcpServer.addTool()", description: "Register custom tools for AI" },
      { name: "mcpServer.getStatus()", description: "Get MCP server status" },
      { name: "mcpServer.listTools()", description: "List available AI tools" }
    ]
  },
  {
    title: "React Hooks",
    methods: [
      { name: "useColumnist()", description: "Main hook for reactive queries" },
      { name: "useLiveQuery()", description: "Real-time queries with auto-updates" },
      { name: "useSearch()", description: "Semantic search with reactive results" },
      { name: "useStats()", description: "Monitor database performance" }
    ]
  }
]

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("getting-started")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Columnist Documentation</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="sticky top-20 space-y-1">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Documentation
              </h3>
              
              {[
                { id: "getting-started", label: "Getting Started", icon: Zap },
                { id: "core-concepts", label: "Core Concepts", icon: Database },
                { id: "search", label: "Semantic Search", icon: Search },
                { id: "sync", label: "Synchronization", icon: Cloud },
                { id: "mcp", label: "AI Integration (MCP)", icon: Brain },
                { id: "chat-app", label: "Chat App with MCP", icon: Code },
                { id: "react", label: "React Integration", icon: Code },
                { id: "api", label: "API Reference", icon: BookOpen },
                { id: "examples", label: "Examples", icon: Brain }
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
          <div className="lg:col-span-3 space-y-12">
            {/* Getting Started */}
            {activeSection === "getting-started" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">Getting Started with Columnist</h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-muted-foreground mb-8">
                    Columnist is a client-side columnar database with semantic search capabilities, 
                    designed for modern web applications with ultra-low memory usage and optional cloud synchronization.
                  </p>

                  <h2 className="text-2xl font-semibold mb-4">Installation</h2>
                  <CodeBlock code={installationCode} language="bash" />

                  <h2 className="text-2xl font-semibold mt-8 mb-4">Basic Usage</h2>
                  <CodeBlock code={basicUsageCode} language="typescript" />

                  <div className="bg-primary/10 p-6 rounded-lg mt-8">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-primary" />
                      Quick Start
                    </h3>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Install the package</li>
                      <li>Define your data schema</li>
                      <li>Initialize the database</li>
                      <li>Start inserting and querying data</li>
                    </ol>
                  </div>
                </div>
              </section>
            )}

            {/* Core Concepts */}
            {activeSection === "core-concepts" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">Core Concepts</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <Database className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Columnar Storage</h3>
                    <p className="text-muted-foreground">
                      Data is stored by column rather than by row, enabling faster queries 
                      and better compression for analytical workloads.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-lg">
                    <Cpu className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Lean Indexing</h3>
                    <p className="text-muted-foreground">
                      Compact in-memory indexes with compressed embeddings enable rapid 
                      queries with minimal RAM usage.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-lg">
                    <Wifi className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Offline-First</h3>
                    <p className="text-muted-foreground">
                      Built on IndexedDB for persistent storage, works completely offline 
                      with optional cloud synchronization.
                    </p>
                  </div>

                  <div className="bg-muted/50 p-6 rounded-lg">
                    <Layers className="h-8 w-8 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Framework Agnostic</h3>
                    <p className="text-muted-foreground">
                      Works with any JavaScript framework - React, Vue, Angular, or vanilla JS. 
                      Includes React hooks for convenience.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Semantic Search */}
            {activeSection === "search" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">Semantic Search</h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-muted-foreground mb-8">
                    Columnist includes built-in semantic search capabilities using TF-IDF and 
                    optional vector embeddings for AI-powered search experiences.
                  </p>

                  <CodeBlock code={searchExampleCode} language="typescript" />

                  <h2 className="text-2xl font-semibold mt-8 mb-4">Search Features</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Full-Text Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Traditional keyword search with relevance scoring
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Semantic Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Meaning-based search using vector embeddings
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Hybrid Search</h4>
                      <p className="text-sm text-muted-foreground">
                        Combine keyword and semantic search for best results
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Filters & Facets</h4>
                      <p className="text-sm text-muted-foreground">
                        Combine search with field-based filtering
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Sync */}
            {activeSection === "sync" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">Synchronization</h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-muted-foreground mb-8">
                    Keep your local data in sync with external databases and services using 
                    Columnist's flexible sync adapter system.
                  </p>

                  <CodeBlock code={syncExampleCode} language="typescript" />

                  <h2 className="text-2xl font-semibold mt-8 mb-4">Supported Adapters</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Firebase</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync with Google Firebase Firestore
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Supabase</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync with Supabase PostgreSQL
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">REST API</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync with any RESTful API
                      </p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-semibold mt-8 mb-4">MCP Integration</h2>
                  <CodeBlock code={mcpExampleCode} language="typescript" />
                  
                  <div className="bg-primary/10 p-6 rounded-lg mt-6">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      AI-Powered Applications
                    </h3>
                    <p className="text-sm">
                      MCP (Model Context Protocol) enables AI assistants to directly interact with your database,
                      providing powerful tools for search, querying, and data analysis.
                    </p>
                  </div>

                  <h2 className="text-2xl font-semibold mt-8 mb-4">Sync Features</h2>
                  
                  <ul className="list-disc list-inside space-y-2">
                    <li>Real-time synchronization</li>
                    <li>Conflict resolution strategies</li>
                    <li>Automatic retries with backoff</li>
                    <li>Selective table synchronization</li>
                    <li>Offline queue with replay</li>
                  </ul>
                </div>
              </section>
            )}

            {/* Chat App with MCP */}
            {activeSection === "chat-app" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">Chat Application with MCP Integration</h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-muted-foreground mb-8">
                    Build intelligent chat applications that AI assistants can interact with using 
                    the Model Context Protocol (MCP). This example shows a complete chat app setup.
                  </p>

                  <CodeBlock code={chatAppMCPCode} language="typescript" />

                  <h2 className="text-2xl font-semibold mt-8 mb-4">AI Assistant Capabilities</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Semantic Chat Search</h4>
                      <p className="text-sm text-muted-foreground">
                        AI can search through chat history using natural language queries
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Chat Analytics</h4>
                      <p className="text-sm text-muted-foreground">
                        Get insights on chat patterns, activity levels, and user behavior
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Real-time Querying</h4>
                      <p className="text-sm text-muted-foreground">
                        AI assistants can query live chat data as conversations happen
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">Custom Tools</h4>
                      <p className="text-sm text-muted-foreground">
                        Define specialized tools for AI to interact with your chat data
                      </p>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 flex items-center">
                      <Brain className="h-5 w-5 mr-2 text-primary" />
                      Claude Integration Example
                    </h3>
                    <p className="text-sm mb-4">
                      Once your MCP server is running, Claude can interact with your chat database:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>"Search for messages about project deadlines"</li>
                      <li>"Show me chat activity for the last week"</li>
                      <li>"Find conversations where users discussed pricing"</li>
                      <li>"Analyze peak conversation times"</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* React Integration */}
            {activeSection === "react" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">React Integration</h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-muted-foreground mb-8">
                    Columnist provides first-class React support with hooks for seamless 
                    integration into your React applications.
                  </p>

                  <CodeBlock code={reactHookExampleCode} language="typescript" />

                  <h2 className="text-2xl font-semibold mt-8 mb-4">Available Hooks</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">useColumnist</h4>
                      <p className="text-sm text-muted-foreground">
                        Main hook for querying data with automatic re-rendering
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">useLiveQuery</h4>
                      <p className="text-sm text-muted-foreground">
                        Real-time queries that update when data changes
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">useSearch</h4>
                      <p className="text-sm text-muted-foreground">
                        Semantic search with reactive results
                      </p>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded">
                      <h4 className="font-semibold mb-2">useStats</h4>
                      <p className="text-sm text-muted-foreground">
                        Monitor database statistics and performance
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* API Reference */}
            {activeSection === "api" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">API Reference</h1>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-muted-foreground mb-8">
                    Comprehensive reference for all Columnist methods and APIs.
                  </p>

                  {apiReference.map((category) => (
                    <div key={category.title} className="mb-8">
                      <h2 className="text-2xl font-semibold mb-4">{category.title}</h2>
                      <div className="space-y-2">
                        {category.methods.map((method) => (
                          <div key={method.name} className="bg-muted/50 p-4 rounded">
                            <code className="text-sm font-mono text-primary">{method.name}</code>
                            <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Examples */}
            {activeSection === "examples" && (
              <section>
                <h1 className="text-3xl font-bold mb-6">Examples & Use Cases</h1>
                
                <div className="prose prose-lg max-w-none">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3">Chat Applications</h3>
                      <p className="text-muted-foreground mb-4">
                        Build real-time chat apps with semantic message search and offline support.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Instant message search</li>
                        <li>Offline message storage</li>
                        <li>Real-time synchronization</li>
                        <li>Low memory footprint</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3">Knowledge Bases</h3>
                      <p className="text-muted-foreground mb-4">
                        Create intelligent knowledge bases with AI-powered semantic search.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Semantic document retrieval</li>
                        <li>Fast full-text search</li>
                        <li>Hybrid search capabilities</li>
                        <li>Vector embeddings support</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3">E-commerce</h3>
                      <p className="text-muted-foreground mb-4">
                        Build product catalogs with advanced search and filtering.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Product search with filters</li>
                        <li>Faceted navigation</li>
                        <li>Offline browsing</li>
                        <li>Real-time inventory updates</li>
                      </ul>
                    </div>

                    <div className="bg-muted/50 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-3">Analytics Dashboards</h3>
                      <p className="text-muted-foreground mb-4">
                        Create fast, responsive dashboards with client-side data processing.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Fast columnar queries</li>
                        <li>Real-time data updates</li>
                        <li>Low memory usage</li>
                        <li>Offline data analysis</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}