// Debug script to test vector search functionality
// Mock browser environment for testing
const { indexedDB, IDBKeyRange } = require('fake-indexeddb');
global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;
if (typeof global.window === 'undefined') {
  global.window = {};
}

const { Columnist } = require('./dist/lib/columnist');

async function debugVectorTest() {
  console.log('=== Debug Vector Search Test ===');
  
  try {
    // Initialize with test schema
    const db = await Columnist.init('debug-test', {
      schema: {
        messages: {
          columns: {
            id: "number",
            user_id: "number", 
            content: "string",
            timestamp: "date",
            priority: "number"
          },
          primaryKey: "id",
          searchableFields: ["content"],
          indexes: ["user_id", "timestamp", "priority"],
          vector: {
            field: "content",
            dims: 384
          }
        }
      },
      version: 2
    });

    // Register mock embedder
    const mockEmbedder = async (text) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      
      const vector = new Float32Array(384);
      for (let i = 0; i < 384; i++) {
        vector[i] = Math.sin(hash + i) * 0.5;
      }
      return vector;
    };

    db.registerEmbedder("messages", mockEmbedder);

    // Insert test data
    console.log('Inserting test data...');
    const testData = [
      { user_id: 1, content: "AI ethics is crucial for responsible development", priority: 5, timestamp: new Date() },
      { user_id: 2, content: "Machine learning models need better transparency", priority: 4, timestamp: new Date() }
    ];

    for (const msg of testData) {
      const result = await db.insert(msg, "messages");
      console.log('Inserted message ID:', result.id, 'Content:', msg.content.substring(0, 30));
    }

    // Test vector search
    console.log('\nTesting vector search...');
    const queryText = "AI ethics and transparency";
    const queryVector = await mockEmbedder(queryText);
    console.log('Query vector length:', queryVector.length);

    const results = await db.vectorSearch("messages", queryVector, {
      metric: "cosine",
      limit: 5
    });

    console.log('Vector search results:', results.length);
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. ID: ${r.id}, Score: ${r.score.toFixed(4)}, Content: ${r.content.substring(0, 40)}...`);
    });

    // Test regular search for comparison
    console.log('\nTesting regular search...');
    const textResults = await db.search("ethics", {
      table: "messages",
      limit: 5
    });
    console.log('Text search results:', textResults.length);

  } catch (error) {
    console.error('Error during debug test:', error);
    throw error;
  }
}

debugVectorTest().catch(console.error);