const { Columnist, defineTable } = require('@columnist/db');

console.log('✅ Successfully imported Columnist!');
console.log('Columnist:', typeof Columnist);
console.log('defineTable:', typeof defineTable);

// Test basic functionality
async function test() {
  try {
    // Define a simple schema
    const schema = {
      users: defineTable({
        id: 'string',
        name: 'string',
        email: 'string'
      }).primaryKey('id')
    };

    // Initialize database
    await Columnist.init({
      name: 'test-db',
      version: 1,
      schema
    });

    console.log('✅ Database initialized successfully!');

    // Test insert
    await Columnist.insert('users', {
      id: '1',
      name: 'Test User',
      email: 'test@example.com'
    });

    console.log('✅ Record inserted successfully!');

    // Test query
    const users = await Columnist.getAll('users');
    console.log('✅ Found users:', users);

    console.log('🎉 All tests passed! Columnist is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

test();
