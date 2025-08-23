// Test to verify browser vector search functionality
console.log('Testing browser vector search...');

// Check if we're in a browser environment
if (typeof window !== 'undefined' && window.Columnist) {
  async function testBrowserVector() {
    try {
      console.log('Initializing test database...');
      
      // Simple schema
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
            dims: 3
          }
        }
      };

      const db = await window.Columnist.init('browser-test', { schema, version: 1 });
      
      // Simple mock embedder
      const mockEmbedder = async (text) => {
        const vec = new Float32Array(3);
        vec[0] = text.length * 0.1;
        vec[1] = text.includes('test') ? 0.8 : 0.2;
        vec[2] = text.includes('vector') ? 0.7 : 0.3;
        return vec;
      };

      db.registerEmbedder("test_docs", mockEmbedder);

      // Insert test data
      console.log('Inserting test documents...');
      const testDocs = [
        { content: "This is a test document", timestamp: new Date() },
        { content: "Another test for vectors", timestamp: new Date() }
      ];

      for (const doc of testDocs) {
        const result = await db.insert(doc, "test_docs");
        console.log('Inserted:', result.id, doc.content);
      }

      // Test vector search
      console.log('Testing vector search...');
      const queryVector = await mockEmbedder("test vector");
      const results = await db.vectorSearch("test_docs", queryVector, {
        metric: "cosine",
        limit: 5
      });

      console.log('Vector search results:', results);
      
    } catch (error) {
      console.error('Error in browser vector test:', error);
    }
  }

  testBrowserVector();
} else {
  console.log('Not in browser environment or Columnist not available');
}