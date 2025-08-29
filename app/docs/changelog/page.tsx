"use client"

export default function ChangelogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">Changelog</h1>
        <p className="text-xl text-muted-foreground mb-8">
          History of changes, new features, and improvements to Columnist. Stay up to date 
          with the latest developments and see what's coming next.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <div className="border-l-2 border-primary pl-6">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Version 1.2.0</h2>
            <p className="text-sm text-muted-foreground mb-4">January 2025</p>
            
            <h3 className="text-lg font-semibold mb-2">New Features</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>MCP (Model Context Protocol) integration for AI access</li>
              <li>Cross-device synchronization with conflict resolution</li>
              <li>Enhanced vector search capabilities</li>
              <li>React hooks for real-time data binding</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Improvements</h3>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Reduced memory usage to ~48 bytes per record</li>
              <li>Faster search performance with optimized indexing</li>
              <li>Improved TypeScript type definitions</li>
              <li>Better error handling and validation</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">Documentation</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Complete API reference documentation</li>
              <li>MCP integration guides</li>
              <li>React hook examples</li>
              <li>Performance optimization tips</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Version 1.1.0</h2>
            <p className="text-sm text-muted-foreground mb-4">December 2024</p>
            
            <h3 className="text-lg font-semibold mb-2">New Features</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Initial public release</li>
              <li>Columnar storage engine</li>
              <li>Full-text search with TF-IDF</li>
              <li>Basic CRUD operations</li>
              <li>IndexedDB persistence</li>
            </ul>
          </div>
        </div>

        <div className="bg-primary/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Upcoming Features</h3>
          <p className="text-sm mb-4">
            Here's what we're working on for future releases:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Advanced memory management for AI applications</li>
            <li>Enhanced privacy and security features</li>
            <li>Multi-modal support (images, documents, audio)</li>
            <li>Real-time collaboration features</li>
            <li>Additional sync adapters and cloud integrations</li>
          </ul>
        </div>
      </div>
    </div>
  )
}