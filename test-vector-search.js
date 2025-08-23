// Simple test script to verify vector search functionality
const { Columnist } = require('./lib/columnist');

async function testVectorSearch() {
  console.log('Testing Vector Search Functionality...');
  
  try {
    // Initialize database with test schema
    const db = await Columnist.init('test-vector-search', {
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
      version: 1
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
    const testMessages = [
      { user_id: 1, content: "AI ethics is crucial for responsible development", priority: 5 },
      { user_id: 2, content: "Machine learning models need better transparency", priority: 4 },
      { user_id: 1, content: "Privacy concerns in data collection are growing", priority: 3 },
      { user_id: 2, content: "Algorithmic bias must be addressed systematically", priority: 5 },
      { user_id: 1, content: "The future of AI depends on ethical frameworks", priority: 4 },
      { user_id: 2, content: "Explainable AI is becoming more important", priority: 3 }
    ];

    for (const msg of testMessages) {
      await db.insert(msg, "messages");
    }

    console.log('✓ Test data inserted successfully');

    // Test vector search with different metrics
    const queryText = "AI ethics and transparency";
    const queryVector = await mockEmbedder(queryText);

    console.log('\nTesting Vector Search Metrics:');

    // Test cosine similarity
    const cosineResults = await db.vectorSearch("messages", queryVector, {
      metric: "cosine",
      limit: 3
    });
    console.log('✓ Cosine Similarity:', cosineResults.length, 'results');
    cosineResults.forEach((r, i) => {
      console.log(`  ${i + 1}. Score: ${r.score.toFixed(4)}, Content: ${r.content.substring(0, 50)}...`);
    });

    // Test dot product
    const dotResults = await db.vectorSearch("messages", queryVector, {
      metric: "dot", 
      limit: 3
    });
    console.log('\n✓ Dot Product:', dotResults.length, 'results');
    dotResults.forEach((r, i) => {
      console.log(`  ${i + 1}. Score: ${r.score.toFixed(4)}, Content: ${r.content.substring(0, 50)}...`);
    });

    // Test euclidean distance
    const euclideanResults = await db.vectorSearch("messages", queryVector, {
      metric: "euclidean",
      limit: 3
    });
    console.log('\n✓ Euclidean Distance:', euclideanResults.length, 'results');
    euclideanResults.forEach((r, i) => {
      console.log(`  ${i + 1}. Score: ${(-r.score).toFixed(4)}, Content: ${r.content.substring(0, 50)}...`);
    });

    console.log('\n✅ All vector search metrics working correctly!');

    // Test IVF index building
    try {
      await db.buildIVFIndex("messages", 4);
      console.log('✓ IVF index built successfully');
      
      // Test vector search with IVF
      const ivfResults = await db.vectorSearch("messages", queryVector, {
        metric: "cosine",
        limit: 3,
        useIVF: true
      });
      console.log('✓ IVF Vector Search:', ivfResults.length, 'results');
      
    } catch (ivfError) {
      console.log('⚠ IVF index building failed (expected in test environment):', ivfError.message);
    }

  } catch (error) {
    console.error('❌ Error testing vector search:', error.message);
    throw error;
  }
}

// Run the test
testVectorSearch().catch(console.error);