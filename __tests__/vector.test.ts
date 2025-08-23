import { Columnist, defineTable } from '../lib/columnist';

describe('Vector Search', () => {
  test('should support vector operations', async () => {
    const schema = {
      documents: defineTable()
        .column('id', 'number')
        .column('content', 'string')
        .column('embedding', 'json')
        .primaryKey('id')
        .vector({ field: 'content', dims: 3 })
        .build()
    };

    const db = await Columnist.init('vector-test', { schema, version: 1 });
    
    // Mock embedder function
    const mockEmbedder = async (text: string): Promise<Float32Array> => {
      // Simple mock embedding based on text length
      const vec = new Float32Array(3);
      vec[0] = text.length * 0.1;
      vec[1] = text.includes('ai') ? 0.8 : 0.2;
      vec[2] = text.includes('data') ? 0.7 : 0.3;
      return vec;
    };

    db.registerEmbedder('documents', mockEmbedder);

    // Insert some documents
    await db.insert({ 
      id: 1, 
      content: 'Artificial intelligence is transforming technology',
      embedding: await mockEmbedder('Artificial intelligence is transforming technology')
    }, 'documents');

    await db.insert({ 
      id: 2, 
      content: 'Data science and machine learning',
      embedding: await mockEmbedder('Data science and machine learning')
    }, 'documents');

    await db.insert({ 
      id: 3, 
      content: 'Web development with modern frameworks',
      embedding: await mockEmbedder('Web development with modern frameworks')
    }, 'documents');

    // Test vector search
    const queryVector = await mockEmbedder('ai and data');
    const results = await db.vectorSearch('documents', queryVector, { limit: 2 });
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('score');
    expect(results[0]).toHaveProperty('id');
  });

  test('should support text-based vector search with caching', async () => {
    const schema = {
      articles: defineTable()
        .column('id', 'number')
        .column('title', 'string')
        .primaryKey('id')
        .vector({ field: 'title', dims: 3 })
        .build()
    };

    const db = await Columnist.init('vector-cache-test', { schema, version: 1 });
    
    // Mock embedder function
    let embedCallCount = 0;
    const mockEmbedder = async (text: string): Promise<Float32Array> => {
      embedCallCount++;
      const vec = new Float32Array(3);
      vec[0] = text.length * 0.1;
      return vec;
    };

    db.registerEmbedder('articles', mockEmbedder);

    // First search - should call embedder
    const results1 = await db.vectorSearchText('articles', 'test query', { limit: 1 });
    expect(embedCallCount).toBe(1);

    // Second search with same text - should use cache
    const results2 = await db.vectorSearchText('articles', 'test query', { limit: 1 });
    expect(embedCallCount).toBe(1); // Should not increase

    expect(results1.length).toBe(0); // No articles in database
    expect(results2.length).toBe(0);
  });

  test('should support IVF index for approximate nearest neighbor search', async () => {
    const schema = {
      products: defineTable()
        .column('id', 'number')
        .column('name', 'string')
        .column('description', 'string')
        .primaryKey('id')
        .vector({ field: 'description', dims: 3 })
        .build()
    };

    const db = await Columnist.init('ivf-test', { schema, version: 1 });
    
    // Mock embedder function
    const mockEmbedder = async (text: string): Promise<Float32Array> => {
      const vec = new Float32Array(3);
      vec[0] = text.length * 0.1;
      vec[1] = text.includes('tech') ? 0.9 : 0.1;
      vec[2] = text.includes('book') ? 0.8 : 0.2;
      return vec;
    };

    db.registerEmbedder('products', mockEmbedder);

    // Insert multiple products to test clustering
    const products = [
      { id: 1, name: 'Laptop', description: 'High performance tech device for work' },
      { id: 2, name: 'Smartphone', description: 'Modern tech gadget with advanced features' },
      { id: 3, name: 'Tablet', description: 'Portable tech device for entertainment' },
      { id: 4, name: 'Novel', description: 'Fiction book with engaging story' },
      { id: 5, name: 'Textbook', description: 'Educational book for learning' },
      { id: 6, name: 'Cookbook', description: 'Recipe book for cooking enthusiasts' }
    ];

    for (const product of products) {
      await db.insert(product, 'products');
    }

    // Build IVF index
    await db.buildIVFIndex('products', 2); // 2 centroids for tech vs books

    // Test vector search with IVF
    const queryVector = await mockEmbedder('tech device');
    const results = await db.vectorSearch('products', queryVector, { 
      limit: 3, 
      useIVF: true,
      metric: 'cosine'
    });
    
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('score');
    expect(results[0]).toHaveProperty('id');
    
    // Results should be tech products (closer to tech centroid)
    const techProducts = results.filter(r => 
      ['Laptop', 'Smartphone', 'Tablet'].includes((r as any).name)
    );
    expect(techProducts.length).toBeGreaterThan(0);
  });
});