"use client"

import { useEffect, useState } from "react"
import { Columnist, defineTable } from "@/lib"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Test schema with validation
const testSchema = {
  messages: defineTable()
    .column("id", "number")
    .column("user_id", "number")
    .column("content", "string")
    .column("timestamp", "date")
    .column("priority", "number")
    .primaryKey("id")
    .searchable("content")
    .indexes("user_id", "timestamp", "priority")
    .vector({
      field: "content",
      dims: 384
    })
    .validate(z.object({
      id: z.number().optional(),
      user_id: z.number().min(1),
      content: z.string().min(1, "Content required"),
      timestamp: z.date().default(() => new Date()),
      priority: z.number().min(1).max(5).default(3)
    }))
    .build(),
    
  users: defineTable()
    .column("id", "number")
    .column("name", "string")
    .column("email", "string")
    .column("created_at", "date")
    .primaryKey("id")
    .searchable("name", "email")
    .indexes("email")
    .validate(z.object({
      id: z.number().optional(),
      name: z.string().min(2),
      email: z.string().email(),
      created_at: z.date().default(() => new Date())
    }))
    .build()
} as const

// Mock embedder that returns random vectors (replace with real embedder)
const mockEmbedder = async (text: string): Promise<Float32Array> => {
  console.log('Mock embedder called with text:', text.substring(0, 50))
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // Generate deterministic "embedding" based on text
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  const vector = new Float32Array(384)
  for (let i = 0; i < 384; i++) {
    vector[i] = Math.sin(hash + i) * 0.5
  }
  
  console.log('Generated vector:', Array.from(vector.slice(0, 5)))
  return vector
}

export default function TestPage() {
  const [dbStatus, setDbStatus] = useState<string>("Initializing...")
  const [searchTerm, setSearchTerm] = useState("AI ethics")
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [vectorResults, setVectorResults] = useState<any>({
    cosine: [],
    dot: [],
    euclidean: []
  })
  const [stats, setStats] = useState<any>(null)
  const [exportData, setExportData] = useState("")

  // Initialize database
  useEffect(() => {
    let db: any
    let initialized = false
    
    const initDb = async () => {
      if (initialized) return
      initialized = true
      
      try {
        setDbStatus("Initializing database...")
        
        // Initialize with schema
        db = await Columnist.init("columnist-test", {
          schema: testSchema,
          version: 2
        })
        
        // Register mock embedder for vector search
        db.registerEmbedder("messages", mockEmbedder)
        console.log('Mock embedder registered for messages table')
        
        // Small delay to ensure embedder is properly registered
        await new Promise(resolve => setTimeout(resolve, 100))
        
        setDbStatus("Database initialized successfully!")
        
        // Subscribe to changes
        const unsubscribe = db.subscribe("messages", (event: any) => {
          console.log("Database event:", event)
          loadMessages() // Reload when data changes
        })
        
        // Load initial data
        await loadInitialData(db)
        await loadMessages()
        await loadStats()
        
        // Build IVF index for better vector search performance
        try {
          await db.buildIVFIndex("messages", 8)
          setDbStatus("Database initialized with IVF index!")
        } catch (error) {
          console.warn("IVF index building failed:", error)
          setDbStatus("Database initialized (IVF index not available)")
        }
        
        return () => unsubscribe()
      } catch (error: any) {
        setDbStatus(`Error: ${error.message}`)
        console.error("Database initialization failed:", error)
      }
    }
    
    initDb()
  }, [])

  const loadInitialData = async (db: any) => {
    try {
      
      // Insert test users
      await db.insert({
        name: "Alice Johnson",
        email: "alice@example.com"
      }, "users")
      
      await db.insert({
        name: "Bob Smith", 
        email: "bob@example.com"
      }, "users")
      
      // Insert test messages
      const testMessages = [
        { user_id: 1, content: "AI ethics is crucial for responsible development", priority: 5 },
        { user_id: 2, content: "Machine learning models need better transparency", priority: 4 },
        { user_id: 1, content: "Privacy concerns in data collection are growing", priority: 3 },
        { user_id: 2, content: "Algorithmic bias must be addressed systematically", priority: 5 },
        { user_id: 1, content: "The future of AI depends on ethical frameworks", priority: 4 },
        { user_id: 2, content: "Explainable AI is becoming more important", priority: 3 },
        { user_id: 1, content: "Data governance policies need updating", priority: 2 },
        { user_id: 2, content: "AI safety research is underfunded", priority: 5 }
      ]
      
      for (const msg of testMessages) {
        await db.insert(msg, "messages")
      }
      
      setDbStatus("Test data loaded successfully!")
    } catch (error: any) {
      setDbStatus(`Error loading data: ${error.message}`)
    }
  }

  const loadMessages = async () => {
    try {
      const db = Columnist.getDB()
      const allMessages = await db.find({
        table: "messages",
        orderBy: { field: "timestamp", direction: "desc" },
        limit: 100
      })
      setMessages(allMessages)
    } catch (error: any) {
      console.error("Failed to load messages:", error)
    }
  }

  const loadStats = async () => {
    try {
      const db = Columnist.getDB()
      const overallStats = await db.getStats()
      setStats(overallStats)
    } catch (error: any) {
      console.error("Failed to load stats:", error)
    }
  }

  const addMessage = async () => {
    if (!newMessage.trim()) return
    
    try {
      const db = Columnist.getDB()
      await db.insert({
        user_id: Math.floor(Math.random() * 2) + 1,
        content: newMessage,
        priority: Math.floor(Math.random() * 5) + 1
      }, "messages")
      
      setNewMessage("")
      setDbStatus("Message added successfully!")
    } catch (error: any) {
      setDbStatus(`Error adding message: ${error.message}`)
    }
  }

  const performSearch = async () => {
    try {
      const db = Columnist.getDB()
      
      // Full-text search
      const textResults = await db.search(searchTerm, {
        table: "messages",
        limit: 10
      })
      setSearchResults(textResults)
      
      // Vector search with different metrics
      const queryVector = await mockEmbedder(searchTerm)
      console.log("Query vector generated:", Array.from(queryVector.slice(0, 5)))
      
      // Debug: Check if vectors exist in the database
      const vectorDb = Columnist.getDB()
      try {
        // Use direct IndexedDB access to check vector store
        const tx = vectorDb.db.transaction(["_vec_messages"], "readonly")
        const store = tx.objectStore("_vec_messages")
        const countRequest = store.count()
        const count = await new Promise<number>((resolve, reject) => {
          countRequest.onsuccess = () => resolve(countRequest.result)
          countRequest.onerror = () => reject(countRequest.error)
        })
        console.log("Vectors in database:", count)
        
        // Get all vectors for detailed inspection
        const allVectorsRequest = store.getAll()
        const allVectors = await new Promise<any[]>((resolve, reject) => {
          allVectorsRequest.onsuccess = () => resolve(allVectorsRequest.result)
          allVectorsRequest.onerror = () => reject(allVectorsRequest.error)
        })
        
        if (allVectors.length > 0) {
          console.log("First vector:", allVectors[0])
          console.log("Vector dimensions:", allVectors[0].vector.length)
          console.log("Vector values (first 5):", allVectors[0].vector.slice(0, 5))
        }
      } catch (error) {
        console.log("Error checking vector store:", error)
      }
      
      const cosineResults = await db.vectorSearch("messages", queryVector, {
        limit: 5,
        metric: "cosine"
      })
      console.log("Cosine results:", cosineResults)
      
      const dotResults = await db.vectorSearch("messages", queryVector, {
        limit: 5,
        metric: "dot"
      })
      console.log("Dot results:", dotResults)
      
      const euclideanResults = await db.vectorSearch("messages", queryVector, {
        limit: 5,
        metric: "euclidean"
      })
      console.log("Euclidean results:", euclideanResults)
      
      setVectorResults({
        cosine: cosineResults,
        dot: dotResults,
        euclidean: euclideanResults
      })
      
      setDbStatus(`Search completed: ${textResults.length} text results, ${cosineResults.length} vector results`)
    } catch (error: any) {
      console.error("Search error:", error)
      setDbStatus(`Search error: ${error.message}`)
    }
  }

  const exportDatabase = async () => {
    try {
      const db = Columnist.getDB()
      const data = await db.export()
      setExportData(JSON.stringify(data, null, 2))
      setDbStatus("Database exported successfully!")
    } catch (error: any) {
      setDbStatus(`Export error: ${error.message}`)
    }
  }

  const clearDatabase = async () => {
    try {
      const db = Columnist.getDB()
      await db.import({}, "replace") // Empty import with replace mode
      await loadMessages()
      await loadStats()
      setDbStatus("Database cleared!")
      
      // Reload test data
      await loadInitialData()
    } catch (error: any) {
      setDbStatus(`Clear error: ${error.message}`)
    }
  }

  const checkVectorStore = async () => {
    try {
      const db = Columnist.getDB()
      // Use a test vector to see if any vectors exist
      const testVector = new Float32Array(384)
      for (let i = 0; i < 384; i++) {
        testVector[i] = Math.random() * 0.1
      }
      
      const results = await db.vectorSearch("messages", testVector, {
        metric: "cosine",
        limit: 1
      })
      
      console.log('Vector store check results:', results.length)
      setDbStatus(`Vector search returned ${results.length} results`)
      
    } catch (error: any) {
      console.error('Error checking vector store:', error)
      setDbStatus(`Error: ${error.message}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Columnist Database Test</h1>
        <p className="text-muted-foreground">Testing all database features</p>
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-mono">{dbStatus}</p>
        </div>
      </div>

      {/* Add Message */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter a message about AI, ethics, privacy, etc..."
            rows={3}
          />
          <Button onClick={addMessage} disabled={!newMessage.trim()}>
            Add Message
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Vector Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="flex-1"
            />
            <Button onClick={performSearch}>Search</Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Full-Text Search Results ({searchResults.length})</h4>
              <div className="space-y-2 max-h-40 overflow-auto">
                {searchResults.map((result, i) => (
                  <div key={i} className="p-2 bg-muted rounded text-sm">
                    <div className="font-mono text-xs text-muted-foreground">Score: {result.score.toFixed(3)}</div>
                    <div>{result.content}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Cosine Similarity ({vectorResults.cosine.length})</h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {vectorResults.cosine.map((result: any, i: number) => (
                    <div key={i} className="p-2 bg-muted rounded text-sm">
                      <div className="font-mono text-xs text-muted-foreground">Score: {result.score.toFixed(3)}</div>
                      <div>{result.content}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Dot Product ({vectorResults.dot.length})</h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {vectorResults.dot.map((result: any, i: number) => (
                    <div key={i} className="p-2 bg-muted rounded text-sm">
                      <div className="font-mono text-xs text-muted-foreground">Score: {result.score.toFixed(3)}</div>
                      <div>{result.content}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Euclidean Distance ({vectorResults.euclidean.length})</h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {vectorResults.euclidean.map((result: any, i: number) => (
                    <div key={i} className="p-2 bg-muted rounded text-sm">
                      <div className="font-mono text-xs text-muted-foreground">Distance: {(-result.score).toFixed(3)}</div>
                      <div>{result.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      <Card>
        <CardHeader>
          <CardTitle>All Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-auto">
            {messages.map((msg, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded">
                <div className="flex-1">
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    User {msg.user_id} • Priority {msg.priority} • {new Date(msg.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground">#{msg.id}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Database Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">Total Tables</div>
                <div className="text-2xl">{stats.totalTables}</div>
              </div>
              <div>
                <div className="font-semibold">Overall Size</div>
                <div className="text-2xl">{Math.round(stats.overallBytes / 1024)}KB</div>
              </div>
              <div>
                <div className="font-semibold">Messages</div>
                <div className="text-2xl">{stats.tables.messages?.count || 0}</div>
              </div>
              <div>
                <div className="font-semibold">Users</div>
                <div className="text-2xl">{stats.tables.users?.count || 0}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle>Export/Import</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={exportDatabase}>Export Database</Button>
            <Button variant="destructive" onClick={clearDatabase}>Clear Database</Button>
            <Button variant="outline" onClick={checkVectorStore}>Check Vector Store</Button>
          </div>
          {exportData && (
            <Textarea
              value={exportData}
              readOnly
              rows={10}
              className="font-mono text-xs"
              placeholder="Export data will appear here..."
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="text-center space-x-4">
        <Button variant="outline" asChild>
          <a href="/devtools">Open Devtools</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/">Back to Home</a>
        </Button>
      </div>
    </div>
  )
}
