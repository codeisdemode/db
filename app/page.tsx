"use client"
import { Button } from "@/components/ui/button"
import { FeatureCard } from "@/components/feature-card"
import { UseCaseCard } from "@/components/use-case-card"
import { CodeBlock } from "@/components/code-block"
import {
  ArrowRight,
  Zap,
  Database,
  Cloud,
  Layers,
  Code,
  Smartphone,
  BarChart3,
  Wifi,
  Search,
  Brain,
  Cpu,
} from "lucide-react"
import { ComparisonTable } from "@/components/comparison-table"
import Link from "next/link"

const heroCode = `const db = await Columnist.init("yourApp");
await db.load();

// Instant semantic query
const results = await db.search("AI ethics discussions", { chat_id: 123 });
console.log(results);

// Add data
await db.insert({
  user_id: 43,
  message: "AI ethics matter",
  timestamp: new Date()
});

// Sync with cloud (optional)
await db.sync();`

const demoCode = `// Initialize Columnist
const db = await Columnist.init("chatApp");

// Load data
await db.load();

// Semantic search with filters
const ethicsTalks = await db.search("AI ethics", {
  chat_id: 123,
  timeRange: ["2025-03-01", "2025-03-16"]
});

// Batch insert
await db.transaction(async () => {
  await db.insert({
    user_id: 42,
    message: "Ethics in AI is key",
    timestamp: new Date()
  });
});

// Sync effortlessly
await db.sync();`

const schemaCode = `db.defineSchema({
  messages: {
    user_id: "number",
    message: "string",
    timestamp: "date"
  }
});`

const reactHookCode = `// React Hook
function useMessages(chatId) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const db = Columnist.getDB();
    db.search("recent chats", { chat_id: chatId }).then(setMessages);
    return db.subscribe("messages", setMessages);
  }, [chatId]);
  return messages;
}`

const statsCode = `const stats = await db.getStats();
console.log(stats);
// {
//   messageCount: 20000,
//   memoryUsage: "0.9MB",
//   storageSize: "12MB",
//   queryTime: "2ms"
// }`

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-primary/5 animate-pulse-slow"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-primary/5 animate-pulse-slow"
            style={{ animationDuration: "6s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/5 w-40 h-40 rounded-full bg-primary/5 animate-pulse-slow"
            style={{ animationDuration: "5s" }}
          ></div>

          {/* Database column visualization */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d="M20,20 L20,80 M30,30 L30,70 M40,25 L40,75 M50,15 L50,85 M60,35 L60,65 M70,10 L70,90 M80,40 L80,60"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
              className="text-primary"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl">
          <div className="inline-block mb-6 px-4 py-1.5 bg-primary/10 rounded-full text-primary font-medium text-sm">
            Lightning-Fast, Semantic-Ready Client-Side Database
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 gradient-text">
            A columnar database for <br className="hidden md:block" />
            modern web apps
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Store, query, and sync data instantly with ultra-low memory usage and AI-powered search.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" className="group" asChild>
              <Link href="#">
                Start Free Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="#">View Documentation</Link>
            </Button>
          </div>

          {/* Code example */}
          <div className="w-full max-w-2xl mx-auto relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl blur-sm"></div>
            <div className="relative">
              <CodeBlock code={heroCode} />
            </div>
          </div>
        </div>
      </section>

      {/* Why Columnist Section */}
      <section className="w-full py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Columnist?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Modern apps need speed, smarts, and simplicity. Columnist delivers with a lean, in-memory columnar index
              and optional cloud sync—perfect for offline-first, AI-driven, and real-time web experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Blazing Fast Queries"
              description="Instant access to structured and semantic data with client-side indexing."
            />

            <FeatureCard
              icon={<Cpu className="h-8 w-8" />}
              title="Tiny Footprint"
              description="Uses ~48 bytes/message in RAM—scales to 100K+ records without breaking a sweat."
            />

            <FeatureCard
              icon={<Search className="h-8 w-8" />}
              title="Semantic Search"
              description="Built-in vector embeddings for AI-ready, meaning-based retrieval."
            />

            <FeatureCard
              icon={<Database className="h-8 w-8" />}
              title="Zero Backend Hassle"
              description="No servers needed—runs entirely client-side, with optional cloud sync."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="w-full py-20 px-4 gradient-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Columnist combines advanced Lean Indexed Orchestration with columnar storage to power your app
              efficiently.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Lean Indexing</h3>
                    <p className="text-muted-foreground">
                      A compact in-memory index (with compressed embeddings) enables rapid queries with minimal RAM.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Database className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Columnar Storage</h3>
                    <p className="text-muted-foreground">
                      Data is organized by column for fast retrieval and efficient compression.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Brain className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Semantic Power</h3>
                    <p className="text-muted-foreground">
                      Optional vector embeddings unlock smart, context-aware searches.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-full text-primary">
                    <Cloud className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Seamless Sync</h3>
                    <p className="text-muted-foreground">
                      Sync only what's changed to the cloud—low bandwidth, high speed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="code-window">
                <div className="code-window-header">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
                  </div>
                  <div className="ml-4 text-xs text-muted-foreground">columnist-demo.js</div>
                </div>
                <div className="code-window-body">
                  <pre className="text-sm">
                    <code>{demoCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Features You'll Love</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need for fast, smart, and scalable data management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Brain className="h-8 w-8" />}
              title="AI-Ready Search"
              description="Semantic queries with compressed embeddings—perfect for LLM context."
            />

            <FeatureCard
              icon={<Wifi className="h-8 w-8" />}
              title="Offline-First"
              description="Persist data via IndexedDB for uninterrupted access."
            />

            <FeatureCard
              icon={<Cloud className="h-8 w-8" />}
              title="Real-Time Sync"
              description="Minimal bandwidth keeps your app responsive."
            />

            <FeatureCard
              icon={<Layers className="h-8 w-8" />}
              title="Scalable & Lean"
              description="Handles massive datasets with a tiny memory footprint."
            />
          </div>
        </div>
      </section>

      {/* Built for Developers Section */}
      <section className="w-full py-20 px-4 gradient-bg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Developers</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple APIs, powerful integrations—Columnist fits how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
              <Code className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Easy Schema</h3>
              <p className="text-muted-foreground mb-4">
                Define your data structure with intuitive SDKs that work the way you think.
              </p>
              <CodeBlock code={schemaCode} className="mt-4" />
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
              <Layers className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Framework-Friendly</h3>
              <p className="text-muted-foreground mb-4">
                Seamless integration with popular frameworks like React, Vue, and Angular.
              </p>
              <CodeBlock code={reactHookCode} className="mt-4" />
            </div>

            <div className="bg-background rounded-lg p-6 shadow-sm border border-border">
              <Zap className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Performance Stats</h3>
              <p className="text-muted-foreground mb-4">
                Built-in caching, compression, and efficient columnar storage.
              </p>
              <CodeBlock code={statsCode} className="mt-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="w-full py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Use Cases</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Columnist is perfect for a wide range of modern web applications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <UseCaseCard
              icon={<Smartphone className="h-6 w-6" />}
              title="Chat Apps: Semantic search + real-time messaging"
            />

            <UseCaseCard icon={<Wifi className="h-6 w-6" />} title="Offline PWAs: Fast data access, anywhere" />

            <UseCaseCard icon={<BarChart3 className="h-6 w-6" />} title="Dashboards: Instant updates, low latency" />

            <UseCaseCard
              icon={<Brain className="h-6 w-6" />}
              title="AI Tools: Rich context for LLMs, efficiently delivered"
            />
          </div>
        </div>
      </section>

      {/* Comparative Advantages Section */}
      <section className="w-full py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Columnist Stands Out</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Columnist blends client-side power with AI-ready smarts—no compromises.
            </p>
          </div>

          <div className="rounded-lg border border-border overflow-hidden shadow-sm">
            <ComparisonTable
              features={[
                { name: "Semantic Search", columnist: true, supabase: false, neon: false },
                { name: "Client-Side Speed", columnist: true, supabase: false, neon: false },
                { name: "Ultra-Low RAM", columnist: true, supabase: false, neon: false },
                { name: "Offline Support", columnist: true, supabase: true, neon: false },
                { name: "Real-Time Sync", columnist: true, supabase: true, neon: false },
                { name: "No Backend Required", columnist: true, supabase: false, neon: false },
              ]}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-4 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Get Started Today</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Integrate Columnist in minutes and turbocharge your app.
          </p>

          <Button size="lg" className="group" asChild>
            <Link href="#">
              Start Free Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>

          <p className="mt-6 text-sm text-muted-foreground">No credit card required. Free tier available.</p>

          <div className="flex justify-center gap-4 mt-8">
            <Button variant="link" size="sm" asChild>
              <Link href="#">View Docs</Link>
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="#">See Examples</Link>
            </Button>
            <Button variant="link" size="sm" asChild>
              <Link href="#">Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

