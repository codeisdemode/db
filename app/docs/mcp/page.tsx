"use client"

import { CodeBlock } from "@/components/code-block"

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

// AI tools can now interact with your database via MCP protocol`

const chatAppIntegrationCode = `// Example: AI-powered chat application with MCP

// Custom tool for AI to search chat history
mcpServer.addTool('searchChatHistory', {
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
})

// Tool for AI to analyze chat patterns
mcpServer.addTool('getChatInsights', {
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
    return {
      messageCount: messages.length,
      activeUsers: [...new Set(messages.map(m => m.user_id))].length,
      peakHours: analyzeMessageTiming(messages)
    }
  }
})`

export default function McpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-6">MCP Integration</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Model Context Protocol (MCP) enables AI assistants to directly interact with your database, 
          providing powerful tools for search, querying, and data analysis without custom API development.
        </p>
      </div>

      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold mb-6">What is MCP?</h2>
        <p className="mb-6">
          The Model Context Protocol is a standardized protocol that allows AI systems to securely 
          access and interact with external resources like databases, APIs, and tools. Columnist's 
          MCP integration provides AI assistants with direct access to your database capabilities.
        </p>

        <h2 className="text-2xl font-semibold mb-6">Key Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-muted/50 p-4 rounded">
            <h4 className="font-semibold mb-2">Direct Database Access</h4>
            <p className="text-sm text-muted-foreground">
              AI assistants can query data directly without REST APIs
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded">
            <h4 className="font-semibold mb-2">Semantic Search</h4>
            <p className="text-sm text-muted-foreground">
              Natural language search across your data
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded">
            <h4 className="font-semibold mb-2">Real-time Analytics</h4>
            <p className="text-sm text-muted-foreground">
              AI-powered data analysis and insights
            </p>
          </div>
          
          <div className="bg-muted/50 p-4 rounded">
            <h4 className="font-semibold mb-2">Custom Tools</h4>
            <p className="text-sm text-muted-foreground">
              Extend AI capabilities with domain-specific tools
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Basic Setup</h2>
        <CodeBlock code={mcpExampleCode} language="typescript" />

        <h2 className="text-2xl font-semibold mt-8 mb-6">Example: Chat Application Integration</h2>
        <CodeBlock code={chatAppIntegrationCode} language="typescript" />

        <h2 className="text-2xl font-semibold mt-8 mb-6">AI Assistant Capabilities</h2>
        <p className="mb-4">
          Once your MCP server is running, AI assistants like Claude can:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6">
          <li>Search through chat history using natural language</li>
          <li>Analyze conversation patterns and trends</li>
          <li>Generate insights from your data</li>
          <li>Perform complex queries without code</li>
          <li>Create custom reports and visualizations</li>
        </ul>

        <div className="bg-primary/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Example AI Queries</h3>
          <p className="text-sm mb-4">
            AI assistants can interact with your database using natural language:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>"Search for messages about project deadlines in the last week"</li>
            <li>"Show me the most active users in the engineering channel"</li>
            <li>"Analyze conversation patterns during business hours"</li>
            <li>"Find discussions about API design decisions"</li>
            <li>"Create a summary of last month's team meeting topics"</li>
          </ul>
        </div>
      </div>
    </div>
  )
}