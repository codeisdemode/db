"use client"

export default function ExamplesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Examples & Tutorials</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Practical examples and tutorials showing how to use Columnist in real-world applications. 
          Learn through code examples, step-by-step guides, and complete sample projects.
        </p>
      </div>

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
            <li>MCP integration for AI assistance</li>
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

      <div className="bg-primary/10 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
        <p className="text-sm mb-4">
          We're working on comprehensive examples and tutorials. Check back soon for:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Step-by-step building guides</li>
          <li>Complete sample applications</li>
          <li>Video tutorials</li>
          <li>Interactive code playgrounds</li>
          <li>Community-contributed examples</li>
        </ul>
      </div>
    </div>
  )
}