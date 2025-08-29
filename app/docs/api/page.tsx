"use client"

import { CodeBlock } from "@/components/code-block"

const apiReference = [
  {
    title: "Initialization",
    methods: [
      { name: "Columnist.init()", description: "Initialize database with schema", example: "Columnist.init(name, options)" },
      { name: "db.load()", description: "Load data from persistence", example: "await db.load()" },
      { name: "db.close()", description: "Close database connection", example: "await db.close()" }
    ]
  },
  {
    title: "CRUD Operations",
    methods: [
      { name: "db.insert()", description: "Insert new records", example: "await db.insert(table, data)" },
      { name: "db.update()", description: "Update existing records", example: "await db.update(table, id, updates)" },
      { name: "db.delete()", description: "Delete records", example: "await db.delete(table, id)" },
      { name: "db.find()", description: "Find records with filters", example: "await db.find(table, filters)" },
      { name: "db.getAll()", description: "Get all records from table", example: "await db.getAll(table)" }
    ]
  },
  {
    title: "Search & Query",
    methods: [
      { name: "db.search()", description: "Semantic search across tables", example: "await db.search(query, options)" },
      { name: "db.vectorSearch()", description: "Vector similarity search", example: "await db.vectorSearch(query, options)" },
      { name: "db.hybridSearch()", description: "Hybrid text and vector search", example: "await db.hybridSearch(query, options)" },
      { name: "db.query()", description: "Advanced query builder", example: "db.query().from(table).where(...)" }
    ]
  },
  {
    title: "Sync & Persistence",
    methods: [
      { name: "db.registerSyncAdapter()", description: "Register sync adapter", example: "await db.registerSyncAdapter(name, type, config)" },
      { name: "db.startSync()", description: "Start synchronization", example: "await db.startSync(adapterName)" },
      { name: "db.getSyncStatus()", description: "Get sync status", example: "const status = db.getSyncStatus()" },
      { name: "db.export()", description: "Export database data", example: "const data = await db.export()" },
      { name: "db.import()", description: "Import database data", example: "await db.import(data)" }
    ]
  },
  {
    title: "Utilities",
    methods: [
      { name: "db.getStats()", description: "Get database statistics", example: "const stats = await db.getStats()" },
      { name: "db.subscribe()", description: "Subscribe to changes", example: "const unsubscribe = db.subscribe(callback)" },
      { name: "db.transaction()", description: "Run transactional operations", example: "await db.transaction(async (tx) => {})" },
      { name: "db.getSchema()", description: "Get current schema", example: "const schema = db.getSchema()" }
    ]
  },
  {
    title: "MCP Integration",
    methods: [
      { name: "ColumnistMCPServer()", description: "Initialize MCP server", example: "new ColumnistMCPServer(db, options)" },
      { name: "mcpServer.start()", description: "Start MCP server", example: "await mcpServer.start()" },
      { name: "mcpServer.stop()", description: "Stop MCP server", example: "await mcpServer.stop()" },
      { name: "mcpServer.addTool()", description: "Register custom AI tools", example: "mcpServer.addTool(name, tool)" },
      { name: "mcpServer.getStatus()", description: "Get server status", example: "const status = mcpServer.getStatus()" }
    ]
  }
]

export default function ApiReferencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">API Reference</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Comprehensive reference for all Columnist methods and APIs. This documentation covers 
          the complete interface for interacting with the database programmatically.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        {apiReference.map((category) => (
          <div key={category.title} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category.title}</h2>
            <div className="space-y-4">
              {category.methods.map((method) => (
                <div key={method.name} className="bg-muted/50 p-6 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <code className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                        {method.name}
                      </code>
                      <p className="text-sm text-muted-foreground mt-2">{method.description}</p>
                    </div>
                    {method.example && (
                      <div className="text-xs text-muted-foreground font-mono">
                        {method.example}
                      </div>
                    )}
                  </div>
                  
                  {/* Example usage would go here */}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/10 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Need More Details?</h3>
        <p className="text-sm mb-4">
          For detailed parameter information, return types, and comprehensive examples, 
          check out our interactive API documentation or explore the source code.
        </p>
        <div className="space-y-2 text-sm">
          <div>📚 <strong>Interactive Docs</strong>: Try our live API playground</div>
          <div>💡 <strong>Examples</strong>: See practical usage examples</div>
          <div>🔍 <strong>Source Code</strong>: Explore the implementation details</div>
        </div>
      </div>
    </div>
  )
}