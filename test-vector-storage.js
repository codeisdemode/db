// Simple test to verify vector storage functionality
// Mock browser environment for testing
const { indexedDB, IDBKeyRange } = require('fake-indexeddb');
global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;
if (typeof global.window === 'undefined') {
  global.window = {};
}

const { Columnist, defineTable } = require('./dist/lib');

async function testVectorStorage() {
  console.log('=== Testing Vector Storage ===');
  
  try {
    // Simple schema with 3D vectors for testing
    const schema = {
      test_docs: {
        columns: {
          id: "number",
          content: "string",
          timestamp: "date"
        },
        primaryKey: "id",
        searchableFields: ["content"],
        vector: {
          field: "content",
          dims: 3  // Small dimension for testing
        }
      }
    };

    const db = await Columnist.init('vector-storage-test', { schema, version: 1 });
    
    // Simple mock embedder
    const mockEmbedder = async (text) => {
      const vec = new Float32Array(3);
      vec[0] = text.length * 0.1;
      vec[1] = text.includes('test') ? 0.8 : 0.2;
      vec[2] = text.includes('vector') ? 0.7 : 0.3;
      return vec;
    };

    db.registerEmbedder("test_docs", mockEmbedder);

    // Insert test documents
    console.log('Inserting test documents...');
    const testDocs = [
      { content: "This is a test document about vector search", timestamp: new Date() },
      { content: "Another test for vector storage verification", timestamp: new Date() },
      { content: "Simple test without vector keywords", timestamp: new Date() }
    ];

    for (const doc of testDocs) {
      const result = await db.insert(doc, "test_docs");
      console.log(`Inserted document ID: ${result.id}, Content: ${doc.content.substring(0, 30)}...`);
    }

    // Test vector search
    console.log('\nTesting vector search...');
    const queryVector = await mockEmbedder("test vector search");
    console.log('Query vector:', Array.from(queryVector));

    const results = await db.vectorSearch("test_docs", queryVector, {
      metric: "cosine",
      limit: 5
    });

    console.log(`Vector search results: ${results.length} documents found`);
    results.forEach((r, i) => {
      console.log(`  ${i + 1}. ID: ${r.id}, Score: ${r.score.toFixed(4)}, Content: ${r.content.substring(0, 40)}...`);
    });

    // Check if vectors are stored
    console.log('\nChecking vector storage...');
    const allDocs = await db.getAll("test_docs");
    console.log(`Total documents in database: ${allDocs.length}`);

  } catch (error) {
    console.error('Error during vector storage test:', error);
    throw error;
  }
}

testVectorStorage().catch(console.error);