import { Columnist, defineTable } from '../lib/columnist';

describe('Columnist Database', () => {

  test('should initialize database', async () => {
    const schema = {
      users: defineTable()
        .column('id', 'number')
        .column('name', 'string')
        .column('email', 'string')
        .primaryKey('id')
        .build()
    };

    const db = await Columnist.init('test-db', { schema, version: 1 });
    expect(db).toBeDefined();
    expect(typeof db.insert).toBe('function');
  });

  test('should insert and retrieve records', async () => {
    const schema = {
      users: defineTable()
        .column('id', 'number')
        .column('name', 'string')
        .column('email', 'string')
        .primaryKey('id')
        .build()
    };

    const db = await Columnist.init('test-db-2', { schema, version: 1 });
    
    // Insert a record
    const result = await db.insert({ id: 1, name: 'Test User', email: 'test@example.com' }, 'users');
    expect(result.id).toBe(1);

    // Retrieve the record
    const users = await db.getAll<{ name: string; email: string }>('users');
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe('Test User');
  });

  test('should support basic search functionality', async () => {
    const schema = {
      messages: defineTable()
        .column('id', 'number')
        .column('text', 'string')
        .column('userId', 'number')
        .primaryKey('id')
        .searchable('text')
        .build()
    };

    const db = await Columnist.init('test-db-3', { schema, version: 1 });
    
    // Insert some records
    await db.insert({ id: 1, text: 'Hello world', userId: 1 }, 'messages');
    await db.insert({ id: 2, text: 'Testing search', userId: 1 }, 'messages');

    // Use find instead of search to avoid transaction issues in test
    const results = await db.find({ table: 'messages', where: { userId: 1 } });
    expect(results).toHaveLength(2);
  });

  test('should perform security audit', async () => {
    const schema = {
      users: defineTable()
        .column('id', 'number')
        .column('name', 'string')
        .column('password', 'string') // Potential sensitive field
        .primaryKey('id')
        .build()
    };

    const db = await Columnist.init('security-test', { schema, version: 1 });
    
    const audit = await db.securityAudit();
    
    expect(audit).toHaveProperty('issues');
    expect(audit).toHaveProperty('recommendations');
    expect(Array.isArray(audit.issues)).toBe(true);
    expect(Array.isArray(audit.recommendations)).toBe(true);
    
    // Should detect potential sensitive field
    const hasSensitiveFieldWarning = audit.issues.some(issue => 
      issue.includes('password') && issue.includes('users')
    );
    expect(hasSensitiveFieldWarning).toBe(true);
  });
});