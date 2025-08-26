# columnist-db

> Lightning-fast, semantic-ready client-side database with IndexedDB persistence, full-text search, vector search, React hooks, and cross-device synchronization.

[![NPM Version](https://img.shields.io/npm/v/columnist-db)](https://npmjs.com/package/columnist-db)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🚀 **Lightning Fast** - Columnar storage with smart indexing
- 🔍 **Full-Text Search** - TF-IDF scoring with relevance ranking
- 🤖 **Vector Search** - Semantic search with cosine/dot/euclidean similarity
- 💾 **Real Persistence** - IndexedDB with automatic schema management
- ⚛️ **React Ready** - Hooks for reactive queries and subscriptions
- 🔒 **Type Safe** - Full TypeScript support with schema inference
- 📊 **Analytics** - Built-in performance statistics
- 🔄 **Real-time** - Live subscriptions and automatic UI updates
- 📱 **Offline First** - Works completely client-side
- 🤝 **Cross-Device Sync** - Multi-device synchronization with conflict resolution
- 🛠️ **Developer Tools** - Built-in database inspector
- 🔄 **Zod 4.1 Codecs** - Bi-directional data transformations with automatic serialization
- 🤖 **MCP Integration** - Model Context Protocol server for AI integration

## Zod 4.1 Codec Integration

Columnist now leverages Zod 4.1's new codec API for seamless bi-directional data transformations:

```typescript
import { defineTable } from 'columnist-db-core'
import { z } from 'zod'

// Define a table with automatic Date and JSON transformations
const userTable = defineTable()
  .column('id', 'number')
  .column('name', 'string')
  .column('createdAt', 'date')
  .column('preferences', 'json')
  .primaryKey('id')
  .codec() // Creates automatic codec for Date ↔ ISO string and JSON ↔ string

// Dates and JSON objects are automatically converted:
await db.insert({
  name: "John Doe",
  createdAt: new Date(), // Automatically converted to ISO string for storage
  preferences: { theme: 'dark', notifications: true } // Automatically stringified
})

// When retrieved, they're automatically converted back:
const user = await db.find({ where: { name: "John Doe" } })
console.log(user.createdAt instanceof Date) // true
console.log(typeof user.preferences) // object
```

### Supported Codecs

- **Date Codec**: Automatic `Date` ↔ ISO string conversion
- **JSON Codec**: Automatic object ↔ JSON string conversion  
- **BigInt Codec**: Automatic `BigInt` ↔ string conversion
- **Custom Codecs**: Create your own with Zod's `z.codec()` API

## Quick Start

### Complete Package (All-in-One)

```bash
npm install columnist-db zod
```

### Modular Installation (shadcn-style)

Install only what you need:

```bash
# Core database engine
npm install columnist-db-core zod

# React hooks integration
npm install columnist-db-hooks

# Prebuilt table schemas
npm install columnist-db-table-notes
npm install columnist-db-table-tasks
npm install columnist-db-table-chat

# Plugin extensions
npm install columnist-db-plugin-convex-sync
npm install columnist-db-plugin-openai-embedding
```

### Basic Usage

```typescript
import { Columnist, defineTable } from 'columnist-db'
// or for modular approach:
import { Columnist } from 'columnist-db-core'
import { defineTable } from 'columnist-db-core'
import { z } from 'zod'

// Define your schema
const schema = {
  messages: defineTable()
    .column("id", "number")
    .column("content", "string") 
    .column("user_id", "number")
    .column("timestamp", "date")
    .primaryKey("id")
    .searchable("content")
    .indexes("user_id", "timestamp")
    .validate(z.object({
      content: z.string().min(1),
      user_id: z.number().positive(),
      timestamp: z.date().default(() => new Date())
    }))
    .build()
}

// Initialize database
const db = await Columnist.init("my-app", { schema })

// Insert data
await db.insert({
  content: "Hello world!",
  user_id: 1
}, "messages")

// Search with TF-IDF
const results = await db.search("hello", {
  table: "messages",
  limit: 10
})

// Indexed queries
const recent = await db.find({
  table: "messages",
  where: { user_id: 1 },
  orderBy: { field: "timestamp", direction: "desc" },
  limit: 50
})
```

### React Integration

```typescript
import { useColumnist, useLiveQuery } from 'columnist-db/hooks'
// or for modular approach:
import { useColumnist, useLiveQuery } from 'columnist-db-hooks'

function ChatApp() {
  const { insert, isLoading, error } = useColumnist({
    name: "chat-app",
    schema: mySchema
  })
  
  // Reactive query with auto-updates
  const { data: messages } = useLiveQuery({
    table: "messages",
    where: { user_id: currentUserId },
    orderBy: "timestamp",
    deps: [currentUserId]
  })

  const sendMessage = async (content: string) => {
    await insert({ content, user_id: currentUserId })
    // UI automatically updates via subscription!
  }

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  )
}
```

## API Reference

### Core Database

#### `Columnist.init(name, options)`

Initialize a database instance.

```typescript
const db = await Columnist.init("my-app", {
  schema: mySchema,
  version: 1,
  migrations: {
    2: (db, tx, oldVersion) => {
      // Migration logic
    }
  }
})
```

#### CRUD Operations

```typescript
// Insert
const { id } = await db.insert(record, "table")

// Update
await db.update(id, updates, "table")

// Delete
await db.delete(id, "table")

// Upsert
await db.upsert(record, "table")

// Get all
const records = await db.getAll("table", limit)
```

#### Querying

```typescript
// Indexed queries
const results = await db.find({
  table: "messages",
  where: { 
    user_id: 1,
    timestamp: { $gte: new Date("2025-01-01") }
  },
  orderBy: { field: "timestamp", direction: "desc" },
  limit: 100,
  offset: 0
})

// Full-text search
const matches = await db.search("query", {
  table: "messages",
  limit: 50,
  user_id: 1 // Additional filters
})

// Paginated queries
const { data, nextCursor } = await db.findPage({
  table: "messages",
  orderBy: "id",
  limit: 50,
  cursor: previousCursor
})
```

#### Vector Search

```typescript
// Register embedder
db.registerEmbedder("messages", async (text: string) => {
  // Your embedding function - must return Float32Array
  const response = await fetch('/api/embed', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
  const { embedding } = await response.json()
  return new Float32Array(embedding)
})

// Vector search
const similar = await db.vectorSearch("messages", queryVector, {
  metric: "cosine", // "cosine" | "dot" | "euclidean"
  limit: 10,
  where: { user_id: 1 } // Optional filters
})
```

#### Analytics & Export

```typescript
// Database statistics
const stats = await db.getStats()
// { totalTables: 2, tables: {...}, overallBytes: 1024000 }

const tableStats = await db.getStats("messages")
// { count: 1500, totalBytes: 500000 }

// Export/Import
const backup = await db.export({ tables: ["messages"] })
await db.import(backup, "replace") // or "merge"

// Subscriptions
const unsubscribe = db.subscribe("messages", (event) => {
  console.log(event.type, event.record) // "insert" | "update" | "delete"
})
```

### React Hooks

#### `useColumnist(options)`

Database instance hook with convenience methods.

```typescript
const {
  db,              // Database instance
  insert,          // Insert function
  update,          // Update function  
  delete: del,     // Delete function
  find,            // Find function
  search,          // Search function
  isLoading,       // Loading state
  error            // Error state
} = useColumnist({
  name: "my-app",
  schema: mySchema,
  version: 1
})
```

#### `useLiveQuery(options)`

Reactive query hook with automatic subscriptions.

```typescript
const {
  data,            // Query results
  isLoading,       // Loading state
  error,           // Error state
  refetch          // Manual refetch
} = useLiveQuery({
  table: "messages",
  where: { user_id: currentUserId },
  orderBy: "timestamp",
  limit: 100,
  deps: [currentUserId], // Re-query dependencies
  subscribe: true        // Auto-subscribe to changes
})
```

#### `useSearch(options)`

Reactive search hook.

#### `useDeviceManager()`

Device management hook for cross-device synchronization.

```typescript
const {
  currentDevice,     // Current device information
  allDevices,        // All known devices
  onlineDevices,     // Currently online devices
  updateLastSeen,    // Update device presence
  isLoading,
  error
} = useDeviceManager()
```

## Advanced Features

### Model Context Protocol (MCP) Integration

**Built-in MCP server for AI integration with full database access:**

```typescript
import { ColumnistMCPServer } from 'columnist-db';

// Start MCP server for AI integration
const mcpServer = new ColumnistMCPServer({
  databaseName: 'my-chat-app',
  authToken: 'your-secret-token',
  port: 3000
});

await mcpServer.start();

// AI systems can now access:
// - Chat message history and context
// - User profiles and preferences  
// - Knowledge base content
// - Real-time conversation data
// - Semantic search across all tables
```

**MCP Resource Examples:**
```
mcp://columnist/chat-app/messages/?conversation=123&limit=50
mcp://columnist/chat-app/users/online
mcp://columnist/chat-app/messages/search?query=project+deadline
mcp://columnist/knowledge-base/articles/vector?text=AI+ethics
```

### Cross-Device Synchronization

**Real-time sync across multiple devices with intelligent conflict resolution:**

```typescript
// Get current device information
const deviceManager = await db.getDeviceManager()
const currentDevice = await deviceManager.getCurrentDevice()

// Device-aware conflict resolution prefers:
// 1. Online devices over offline devices  
// 2. Most recent timestamps as fallback
// 3. Local device when all else is equal

// Track device presence with heartbeat
await deviceManager.startPresenceTracking(30000) // 30s heartbeat

// Get all known devices
const allDevices = await deviceManager.getAllDevices()
const onlineDevices = await deviceManager.getOnlineDevices()
```

### Modular Architecture (shadcn-style)

Columnist follows a modular, composable architecture inspired by shadcn/ui:

**Core Packages:**
- `columnist-db-core` - Base database functionality
- `columnist-db-hooks` - React hooks for database operations

**Table Packages:**
- `columnist-db-table-notes` - Pre-built notes table schema
- `columnist-db-table-tasks` - Pre-built tasks table schema  
- `columnist-db-table-chat` - Pre-built chat table schema

**Plugin Packages:**
- `columnist-db-plugin-convex-sync` - Sync with Convex backend
- `columnist-db-plugin-openai-embedding` - Vector search with OpenAI

**Usage Pattern:**
```typescript
import { notesSchema } from 'columnist-db-table-notes'
import { convexSync } from 'columnist-db-plugin-convex-sync'
import { useNotes, useLiveNotes } from 'columnist-db-hooks'

// Compose your database
const db = Columnist.init('my-app', {
  schema: { notes: notesSchema },
  plugins: [convexSync()]
})

// Use generated hooks
const { notes, createNote } = useNotes()
const liveNotes = useLiveNotes() // Real-time subscription
```

```typescript
// Get current device information
const currentDevice = await db.getCurrentDevice()
// {
//   deviceId: "unique-fingerprint",
//   deviceName: "Windows Chrome",
//   platform: "Win32",
//   os: "Windows 10",
//   browser: "Chrome",
//   capabilities: ["offline", "encryption"],
//   createdAt: Date,
//   lastSeen: Date
// }

// Get all known devices
const allDevices = await db.getAllDevices()

// Get online devices
const onlineDevices = await syncManager.getOnlineDevices()

// Update device presence
await db.getDeviceManager().updateLastSeen()
```

### Device-Aware Conflict Resolution

The sync system now includes device-aware conflict resolution that prefers:
1. **Online devices** over offline devices
2. **Most recent timestamps** as fallback
3. **Local device** when all else is equal

### Device Presence Tracking

```typescript
// Start presence tracking (heartbeat every 30 seconds)
await db.startDevicePresenceTracking(30000)

// Get device status
const status = await syncManager.getDeviceStatus(deviceId)
// "online" | "offline"
```

### MCP Server Security Features

**Enterprise-grade security for AI database access:**

```typescript
// JWT Authentication
const authManager = new AuthManager({
  secret: process.env.MCP_AUTH_SECRET,
  requireAuth: true
});

// Security policies
const securityManager = new SecurityManager({
  maxConnections: 100,
  rateLimit: { windowMs: 60000, max: 100 },
  blockedTables: ['passwords', 'api_keys'],
  allowedOperations: ['query', 'search', 'read']
});

// Field-level security
const sanitizedData = securityManager.sanitizeOutput(userData, ['admin']);
// Removes sensitive fields like passwords, tokens, private keys
```

#### `useSearch(options)`

Reactive search hook.

```typescript
const {
  data,            // Search results with scores
  isLoading,
  error,
  refetch
} = useSearch({
  table: "messages",
  query: searchTerm,
  limit: 50,
  deps: [searchTerm]
})
```

#### `useStats(options)`

Database statistics hook.

```typescript
const {
  stats,           // Statistics object
  isLoading,
  error,
  refetch
} = useStats({
  table: "messages",      // Optional: specific table
  refreshInterval: 5000   // Auto-refresh interval
})

// Memory usage helper
const { estimatedRAM } = useMemoryUsage()
```

## Schema Definition

### Fluent Builder API

```typescript
import { defineTable } from 'columnist-db-core'
import { z } from 'zod'

const messageTable = defineTable()
  .column("id", "number")
  .column("content", "string")
  .column("user_id", "number")
  .column("timestamp", "date")
  .column("metadata", "json")
  .column("priority", "number")
  .primaryKey("id")                    // Default: "id"
  .searchable("content")               // Full-text search fields
  .indexes("user_id", "timestamp")     // Secondary indexes
  .validate(z.object({                 // Optional validation
    content: z.string().min(1),
    user_id: z.number().positive(),
    priority: z.number().min(1).max(5).default(3),
    timestamp: z.date().default(() => new Date())
  }))
  .build()
```

### Vector Configuration

```typescript
const documentsTable = defineTable()
  .column("id", "number")
  .column("title", "string")
  .column("content", "string")
  .searchable("title", "content")
  .vector({
    field: "content",    // Source field for embeddings
    dims: 384           // Embedding dimensions
  })
  .build()
```

### Type Inference

```typescript
// Automatic TypeScript types
type MessageType = InferTableType<typeof messageTable>
// { id: number; content: string; user_id: number; timestamp: Date; ... }

// Type-safe database
const typed = db.typed<typeof schema>()
await typed.insert({
  content: "Hello",    // ✅ Typed and validated
  user_id: 1
}, "messages")
```

## Migrations

```typescript
const db = await Columnist.init("my-app", {
  schema: mySchemaV2,
  version: 2,
  migrations: {
    2: (db, tx, oldVersion) => {
      // Add new index
      const store = tx.objectStore("messages")
      if (!Array.from(store.indexNames).includes("priority")) {
        store.createIndex("priority", "priority")
      }
    }
  }
})
```

## Performance

### Memory Usage

- **~48 bytes per record** in RAM (excluding content)
- **Compressed token indexing** for search
- **Lazy loading** of large result sets
- **Efficient date/JSON serialization**

### Query Performance

- **Indexed queries**: O(log n) lookup time
- **Full-text search**: O(k) where k = matching documents
- **Vector search**: O(n) with planned optimizations
- **Range queries**: Optimal with proper indexing

### Storage

- **Columnar IndexedDB storage**
- **Automatic compression** where possible
- **Delta-based statistics** tracking
- **Efficient schema evolution**

## Showcase Application

A complete demonstration app is included in the `/showcase` directory, featuring:

- **Real-time CRUD operations** with automatic UI updates
- **Cross-device synchronization** demo with multiple device simulation
- **Advanced search capabilities** including full-text and vector search
- **Device management interface** showing online/offline status
- **Performance metrics** and memory usage monitoring

To run the showcase:
```bash
cd showcase
npm install
npm run dev
```

## Examples

### Chat Application

```typescript
const chatSchema = {
  messages: defineTable()
    .column("id", "number")
    .column("room_id", "string")
    .column("user_id", "number") 
    .column("content", "string")
    .column("timestamp", "date")
    .searchable("content")
    .indexes("room_id", "user_id", "timestamp")
    .build(),
    
  users: defineTable()
    .column("id", "number")
    .column("name", "string")
    .column("avatar", "string")
    .searchable("name")
    .build()
}

const db = await Columnist.init("chat-app", { schema: chatSchema })

// Send message
await db.insert({
  room_id: "general",
  user_id: currentUser.id,
  content: message
}, "messages")

// Search chat history
const results = await db.search(query, {
  table: "messages", 
  room_id: currentRoom
})
```

### Document Store with Vector Search

```typescript
// Register OpenAI embedder
db.registerEmbedder("documents", async (text) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  })
  return new Float32Array(response.data[0].embedding)
})

// Semantic document search
const similar = await db.vectorSearch("documents", queryEmbedding, {
  metric: "cosine",
  limit: 5
})
```

## Browser Support

- Chrome 58+ (full functionality)
- Firefox 55+ (full functionality)  
- Safari 10+ (full functionality)
- Edge 79+ (full functionality)
- Mobile browsers with IndexedDB support

**Cross-device sync requires:**
- Modern browser with IndexedDB and crypto support
- Network connectivity for device presence tracking
- Same-origin or CORS-enabled sync endpoints

## Development

This is a monorepo managed with Turborepo. To develop locally:

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Develop a specific package
cd packages/core
npm run dev

# Run showcase app
cd showcase
npm run dev
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Columnist.live](https://columnist.live)
