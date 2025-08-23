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
  ExternalLink,
  MessageSquare,
  ShoppingCart,
  BarChart3,
  FileText,
  Smartphone
} from "lucide-react"

const chatAppExample = `// Chat Application Example
import { Columnist, defineTable } from '@columnist/db'

// Define chat schema
const schema = {
  messages: defineTable()
    .column('id', 'number')
    .column('chat_id', 'number')
    .column('user_id', 'number')
    .column('content', 'string')
    .column('timestamp', 'date')
    .primaryKey('id')
    .searchable('content')
    .indexes('chat_id', 'user_id', 'timestamp')
    .build(),
  users: defineTable()
    .column('id', 'number')
    .column('name', 'string')
    .column('avatar', 'string')
    .primaryKey('id')
    .build()
}

// Initialize
const db = await Columnist.init('chat-app', { schema })
await db.load()

// Insert a message
await db.insert({
  chat_id: 1,
  user_id: 42,
  content: "Hello! How can I help you with AI ethics today?",
  timestamp: new Date()
}, 'messages')

// Search messages semantically
const results = await db.search("ethical AI considerations", {
  table: 'messages',
  chat_id: 1,
  limit: 10
})

console.log('Search results:', results)`

const ecommerceExample = `// E-commerce Product Catalog
import { Columnist, defineTable } from '@columnist/db'

const schema = {
  products: defineTable()
    .column('id', 'number')
    .column('name', 'string')
    .column('description', 'string')
    .column('price', 'number')
    .column('category', 'string')
    .column('in_stock', 'boolean')
    .column('tags', 'json')
    .primaryKey('id')
    .searchable('name', 'description')
    .indexes('category', 'price', 'in_stock')
    .build(),
  orders: defineTable()
    .column('id', 'number')
    .column('user_id', 'number')
    .column('items', 'json')
    .column('total', 'number')
    .column('status', 'string')
    .column('created_at', 'date')
    .primaryKey('id')
    .indexes('user_id', 'status', 'created_at')
    .build()
}

const db = await Columnist.init('ecommerce', { schema })
await db.load()

// Add a product
await db.insert({
  name: "Wireless Headphones",
  description: "Premium noise-cancelling wireless headphones with 30hr battery",
  price: 299.99,
  category: "electronics",
  in_stock: true,
  tags: ["wireless", "audio", "premium"]
}, 'products')

// Search products
const headphones = await db.search("wireless audio devices", {
  table: 'products',
  category: 'electronics',
  in_stock: true,
  price: { $lte: 350 }
})`

const knowledgeBaseExample = `// Knowledge Base with Semantic Search
import { Columnist, defineTable } from '@columnist/db'

const schema = {
  articles: defineTable()
    .column('id', 'number')
    .column('title', 'string')
    .column('content', 'string')
    .column('category', 'string')
    .column('tags', 'json')
    .column('created_at', 'date')
    .column('updated_at', 'date')
    .primaryKey('id')
    .searchable('title', 'content')
    .indexes('category', 'created_at')
    .build()
}

const db = await Columnist.init('knowledge-base', { schema })
await db.load()

// Add knowledge base article
await db.insert({
  title: "AI Ethics Best Practices",
  content: "Artificial Intelligence ethics involve ensuring AI systems are fair, transparent, and accountable. Key considerations include bias mitigation, privacy protection, and explainability of AI decisions...",
  category: "ai",
  tags: ["ethics", "ai", "best-practices"],
  created_at: new Date(),
  updated_at: new Date()
}, 'articles')

// Semantic search for related content
const ethicalAI = await db.search("responsible artificial intelligence development", {
  table: 'articles',
  category: 'ai',
  limit: 5
})`

const analyticsDashboardExample = `// Real-time Analytics Dashboard
import { Columnist, defineTable } from '@columnist/db'

const schema = {
  metrics: defineTable()
    .column('id', 'number')
    .column('metric_name', 'string')
    .column('value', 'number')
    .column('timestamp', 'date')
    .column('dimensions', 'json')
    .primaryKey('id')
    .indexes('metric_name', 'timestamp')
    .build(),
  events: defineTable()
    .column('id', 'number')
    .column('event_type', 'string')
    .column('user_id', 'number')
    .column('properties', 'json')
    .column('timestamp', 'date')
    .primaryKey('id')
    .indexes('event_type', 'user_id', 'timestamp')
    .build()
}

const db = await Columnist.init('analytics', { schema })
await db.load()

// Record metric
await db.insert({
  metric_name: 'active_users',
  value: 1423,
  timestamp: new Date(),
  dimensions: { platform: 'web', region: 'us-west' }
}, 'metrics')

// Query metrics for dashboard
const userMetrics = await db.find({
  table: 'metrics',
  where: {
    metric_name: 'active_users',
    timestamp: { 
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
    }
  },
  orderBy: { field: 'timestamp', direction: 'asc' }
})`

const reactChatExample = `// React Chat Component with Real-time Updates
import { useColumnist, useLiveQuery } from '@columnist/db/hooks'

function ChatRoom({ chatId }) {
  // Live messages with real-time updates
  const { data: messages, loading } = useLiveQuery(
    (db) => db.find({
      table: 'messages',
      where: { chat_id: chatId },
      orderBy: { field: 'timestamp', direction: 'desc' },
      limit: 50
    }),
    [chatId]
  )

  // Semantic search within chat
  const [searchQuery, setSearchQuery] = useState('')
  const { data: searchResults } = useColumnist(
    (db) => searchQuery 
      ? db.search(searchQuery, { table: 'messages', chat_id: chatId })
      : Promise.resolve([]),
    [searchQuery, chatId]
  )

  const sendMessage = async (content) => {
    await db.insert({
      chat_id: chatId,
      user_id: currentUser.id,
      content,
      timestamp: new Date()
    }, 'messages')
  }

  if (loading) return <div>Loading messages...</div>

  return (
    <div>
      <input 
        placeholder="Search messages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      <div className="messages">
        {messages.map(message => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      
      <MessageInput onSend={sendMessage} />
    </div>
  )
}`

const syncExample = `// Multi-Platform Sync with Firebase
import { Columnist, FirebaseSyncAdapter } from '@columnist/db/sync'

const db = await Columnist.init('my-app', { schema })
await db.load()

// Configure Firebase sync
await db.registerSyncAdapter('firebase', 'firebase', {
  apiKey: 'your-api-key',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  realtime: true,
  conflictStrategy: 'merge',
  tables: ['messages', 'users']
})

// Start synchronization
await db.startSync('firebase')

// Monitor sync status
const status = db.getSyncStatus('firebase')
console.log('Sync status:', status)

// Listen for sync events
db.getSyncManager()
  .getAdapter('firebase')
  ?.onSyncEvent((event) => {
    console.log('Sync event:', event.type, event.data)
  })`

const examples = [
  {
    id: "chat-app",
    title: "Chat Application",
    description: "Real-time messaging with semantic search and offline support",
    icon: MessageSquare,
    code: chatAppExample,
    features: ["Real-time updates", "Semantic search", "Offline messaging", "User presence"]
  },
  {
    id: "ecommerce",
    title: "E-commerce Store",
    description: "Product catalog with advanced search, filters, and shopping cart",
    icon: ShoppingCart,
    code: ecommerceExample,
    features: ["Product search", "Inventory management", "Shopping cart", "Order tracking"]
  },
  {
    id: "knowledge-base",
    title: "Knowledge Base",
    description: "AI-powered knowledge base with semantic document retrieval",
    icon: FileText,
    code: knowledgeBaseExample,
    features: ["Semantic search", "Content tagging", "Category organization", "Vector embeddings"]
  },
  {
    id: "analytics",
    title: "Analytics Dashboard",
    description: "Real-time analytics with client-side data processing",
    icon: BarChart3,
    code: analyticsDashboardExample,
    features: ["Real-time metrics", "Data visualization", "Historical analysis", "Custom dashboards"]
  },
  {
    id: "react-chat",
    title: "React Chat Component",
    description: "Modern React chat with hooks and real-time synchronization",
    icon: Smartphone,
    code: reactChatExample,
    features: ["React hooks", "Real-time updates", "Message search", "Typing indicators"]
  },
  {
    id: "sync",
    title: "Cloud Synchronization",
    description: "Multi-device sync with conflict resolution and offline support",
    icon: Cloud,
    code: syncExample,
    features: ["Firebase sync", "Conflict resolution", "Offline queue", "Real-time updates"]
  }
]

export default function Examples() {
  const [activeExample, setActiveExample] = useState(examples[0].id)

  const currentExample = examples.find(ex => ex.id === activeExample)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Columnist Examples</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/docs">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Link>
              </Button>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Practical Examples</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore real-world implementations of Columnist across different use cases and applications.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="sticky top-20 space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Example Applications
              </h3>
              
              {examples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setActiveExample(example.id)}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-lg border transition-all ${
                    activeExample === example.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background text-foreground border-border hover:border-primary hover:shadow-sm"
                  }`}
                >
                  <example.icon className="h-5 w-5 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{example.title}</div>
                    <div className="text-xs opacity-80 mt-1">{example.description}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentExample && (
              <div className="bg-background rounded-lg border border-border p-6">
                <div className="flex items-center mb-6">
                  <currentExample.icon className="h-8 w-8 text-primary mr-3" />
                  <div>
                    <h2 className="text-2xl font-bold">{currentExample.title}</h2>
                    <p className="text-muted-foreground">{currentExample.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {currentExample.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Code Example */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Implementation</h3>
                  <CodeBlock 
                    code={currentExample.code} 
                    language="typescript"
                    className="max-h-96 overflow-auto"
                  />
                </div>

                {/* Try It Section */}
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-primary" />
                    Try This Example
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Copy this code into your project and start building with Columnist!
                  </p>
                  <Button size="sm" asChild>
                    <Link href="/docs">
                      View Full Documentation
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-6">
            Start building your next application with Columnist today.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/docs">
                <BookOpen className="h-5 w-5 mr-2" />
                Read Documentation
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/">
                <Zap className="h-5 w-5 mr-2" />
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}