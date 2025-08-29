"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/code-block"
import { InteractiveDemo } from "@/components/interactive-demo"
import { 
  Zap, 
  Database, 
  Search, 
  Cloud, 
  Brain, 
  Code,
  ArrowRight,
  Shield,
  Cpu,
  Wifi,
  Layers
} from "lucide-react"
import { 
  DatabaseIcon,
  AIBrainIcon,
  SearchIcon,
  SecurityIcon,
  SyncIcon,
  PerformanceIcon,
  MemoryIcon
} from "@/components/icons"

const installationCode = `npm install columnist-db-core
# or
yarn add columnist-db-core
# or
pnpm add columnist-db-core`

const quickStartCode = `import { Columnist, defineTable } from 'columnist-db-core'

// Define your schema
const schema = {
  messages: defineTable()
    .column('id', 'string')
    .column('content', 'string')
    .column('timestamp', 'date')
    .primaryKey('id')
    .searchable('content')
    .build()
}

// Initialize and use
const db = await Columnist.init('my-app', { schema })
await db.load()

// Insert data
await db.insert('messages', {
  id: '1',
  content: 'Hello, world!',
  timestamp: new Date()
})

// Search data
const results = await db.search('hello')
console.log(results)`

export default function DocsWelcome() {
  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Columnist</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          A lightning-fast, client-side columnar database with AI integration, 
          built for modern web applications with ultra-low memory usage and optional cloud synchronization.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/docs/documentation">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/examples">
              View Examples
            </Link>
          </Button>
        </div>
      </section>

      {/* Features grid */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Why Columnist?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-lg text-center border border-blue-200/50 dark:border-blue-800/50 hover:shadow-lg transition-all duration-300">
            <PerformanceIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-blue-900 dark:text-blue-100">Lightning Fast</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              <strong>O(log n)</strong> queries with columnar storage<br/>
              <strong>10x faster</strong> than traditional databases
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-lg text-center border border-purple-200/50 dark:border-purple-800/50 hover:shadow-lg transition-all duration-300">
            <AIBrainIcon className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-purple-900 dark:text-purple-100">AI-Native</h3>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              <strong>MCP protocol</strong> for direct AI access<br/>
              <strong>Vector embeddings</strong> & semantic search
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 rounded-lg text-center border border-green-200/50 dark:border-green-800/50 hover:shadow-lg transition-all duration-300">
            <SyncIcon className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-green-900 dark:text-green-100">Offline-First</h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              <strong>100% offline</strong> capability<br/>
              <strong>Real-time sync</strong> across devices
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 rounded-lg text-center border border-orange-200/50 dark:border-orange-800/50 hover:shadow-lg transition-all duration-300">
            <MemoryIcon className="h-12 w-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-orange-900 dark:text-orange-100">Ultra-Efficient</h3>
            <p className="text-orange-700 dark:text-orange-300 text-sm">
              <strong>~48 bytes</strong> per record<br/>
              <strong>90% less</strong> memory usage
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20 p-6 rounded-lg text-center border border-teal-200/50 dark:border-teal-800/50 hover:shadow-lg transition-all duration-300">
            <SearchIcon className="h-12 w-12 text-teal-600 dark:text-teal-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-teal-900 dark:text-teal-100">Smart Search</h3>
            <p className="text-teal-700 dark:text-teal-300 text-sm">
              <strong>Full-text</strong> + <strong>semantic</strong> search<br/>
              <strong>TF-IDF scoring</strong> for relevance
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 p-6 rounded-lg text-center border border-slate-200/50 dark:border-slate-800/50 hover:shadow-lg transition-all duration-300">
            <SecurityIcon className="h-12 w-12 text-slate-600 dark:text-slate-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Enterprise Secure</h3>
            <p className="text-slate-700 dark:text-slate-300 text-sm">
              <strong>Client-side encryption</strong><br/>
              <strong>Zero-knowledge</strong> architecture
            </p>
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section>
        <h2 className="text-3xl font-bold mb-6">Get Started in 5 Minutes</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">Installation</h3>
            <CodeBlock code={installationCode} language="bash" />
            
            <h3 className="text-xl font-semibold mt-6 mb-4">Quick Start</h3>
            <CodeBlock code={quickStartCode} language="typescript" />
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="text-lg font-semibold mb-3 flex items-center text-purple-900 dark:text-purple-100">
                <AIBrainIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                🚀 MCP Integration Ready
              </h4>
              <p className="text-purple-800 dark:text-purple-200 text-sm mb-3">
                First database with native <strong>Model Context Protocol</strong> support
              </p>
              <ul className="list-none space-y-2 text-sm text-purple-700 dark:text-purple-300">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Direct AI database queries via MCP
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Semantic search with vector embeddings
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Real-time chat app integration
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/10 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-3 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                What's Next?
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>Explore the comprehensive documentation</li>
                <li>Learn about MCP integration for AI access</li>
                <li>Check out real-world examples</li>
                <li>Set up cross-device synchronization</li>
                <li>Integrate with React using our hooks</li>
              </ul>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold mb-3">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Join our community or check out these resources:
              </p>
              <div className="space-y-2">
                <Link href="/docs/documentation" className="block text-sm text-primary hover:underline">
                  📚 Full Documentation
                </Link>
                <Link href="/examples" className="block text-sm text-primary hover:underline">
                  💡 Examples & Tutorials
                </Link>
                <Link href="/community" className="block text-sm text-primary hover:underline">
                  👥 Community Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quickstart Guides */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Quickstart Guides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Brain className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-xl font-semibold">AI Chat App</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Build an AI-powered chat application with MCP integration in under 10 minutes.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                MCP Server Setup
              </div>
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Real-time Messaging
              </div>
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Vector Search
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/docs/examples#chat-app">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Search className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-xl font-semibold">Knowledge Base</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Create a searchable knowledge base with semantic search capabilities.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Full-text Search
              </div>
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Document Indexing
              </div>
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Smart Filtering
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/docs/examples#knowledge-base">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="bg-card p-6 rounded-lg border border-border hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <Cloud className="h-8 w-8 text-primary mr-3" />
              <h3 className="text-xl font-semibold">Sync Setup</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Set up cross-device synchronization for offline-first applications.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Device Registration
              </div>
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Conflict Resolution
              </div>
              <div className="flex items-center text-green-600">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                Offline Support
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/docs/documentation#synchronization">
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Try It Yourself</h2>
        <InteractiveDemo />
      </section>

      {/* Cross-Device Sync Visualization */}
      <section className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/10 dark:to-blue-950/10 p-8 rounded-xl border border-green-200/50 dark:border-green-800/50">
        <h2 className="text-3xl font-bold mb-6 text-center">Cross-Device Synchronization</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your data seamlessly syncs across all devices while maintaining full offline capability
        </p>
        
        <div className="flex justify-center items-center space-x-8 mb-6">
          {/* Desktop */}
          <div className="text-center">
            <div className="w-16 h-12 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-t-lg relative">
              <div className="w-12 h-8 bg-blue-500 rounded-sm absolute top-1 left-2 flex items-center justify-center">
                <DatabaseIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="w-20 h-2 bg-gray-300 dark:bg-gray-600 rounded-b-lg"></div>
            <p className="text-xs mt-2 text-muted-foreground">Desktop</p>
          </div>
          
          {/* Sync arrows */}
          <div className="flex items-center space-x-2">
            <SyncIcon className="h-6 w-6 text-green-500 animate-pulse" />
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          
          {/* Mobile */}
          <div className="text-center">
            <div className="w-8 h-14 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-lg relative">
              <div className="w-6 h-10 bg-blue-500 rounded-sm absolute top-1 left-1 flex items-center justify-center">
                <DatabaseIcon className="h-3 w-3 text-white" />
              </div>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">Mobile</p>
          </div>
          
          {/* Sync arrows */}
          <div className="flex items-center space-x-2">
            <SyncIcon className="h-6 w-6 text-green-500 animate-pulse" />
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
          
          {/* Tablet */}
          <div className="text-center">
            <div className="w-12 h-16 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-lg relative">
              <div className="w-10 h-12 bg-blue-500 rounded-sm absolute top-1 left-1 flex items-center justify-center">
                <DatabaseIcon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-xs mt-2 text-muted-foreground">Tablet</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Wifi className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Real-time Updates</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Conflict Resolution</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Database className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Offline Support</span>
          </div>
        </div>
      </section>

      {/* Common Use Cases */}
      <section>
        <h2 className="text-3xl font-bold mb-8">Common Use Cases</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Code className="h-5 w-5 mr-2 text-primary" />
                For Developers
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Building offline-first applications with local data storage
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Integrating AI features with MCP protocol support
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Creating performant search functionality without external dependencies
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Implementing real-time collaboration features
                </li>
              </ul>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                For AI Applications
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Chat applications with conversation history and semantic search
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Knowledge management systems with vector embeddings
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Document analysis and retrieval systems
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Personalized content recommendation engines
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" />
                Enterprise Use Cases
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Internal tools and dashboards with real-time data
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Customer support platforms with search capabilities
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Content management systems with advanced filtering
                </li>
                <li className="flex items-start">
                  <span className="text-primary mt-1 mr-2">•</span>
                  Analytics platforms with offline data processing
                </li>
              </ul>
            </div>

            <div className="bg-primary/10 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Ready to Start?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose your preferred starting point and begin building with Columnist today.
              </p>
              <div className="flex space-x-3">
                <Button asChild size="sm">
                  <Link href="/docs/documentation">
                    Documentation
                  </Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link href="/examples">
                    Examples
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}