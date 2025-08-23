# @columnist/db

> Lightning-fast, semantic-ready client-side database with IndexedDB persistence, full-text search, vector search, and React hooks.

[![NPM Version](https://img.shields.io/npm/v/@columnist/db)](https://npmjs.com/package/@columnist/db)
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
- 🛠️ **Developer Tools** - Built-in database inspector

## Quick Start

```bash
npm install @columnist/db zod
```

### Basic Usage

```typescript
import { Columnist, defineTable } from '@columnist/db'
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
import { useColumnist, useLiveQuery } from '@columnist/db/hooks'

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
import { defineTable } from '@columnist/db'
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

- Chrome 58+
- Firefox 55+
- Safari 10+
- Edge 79+

Requires IndexedDB support.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Columnist.live](https://columnist.live)
