import { Columnist, defineTable } from '../lib/columnist';

describe('Security Features', () => {
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

  test('should support encryption with authentication', async () => {
    // Skip encryption test if Web Crypto API is not available (Node.js environment)
    if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
      console.warn('Skipping encryption test - Web Crypto API not available');
      return;
    }
    const schema = {
      secrets: defineTable()
        .column('id', 'number')
        .column('api_key', 'string') // Sensitive field
        .column('data', 'string')
        .primaryKey('id')
        .build()
    };

    const db = await Columnist.init('encryption-test', { 
      schema, 
      version: 1,
      encryptionKey: 'my-secret-key-123'
    });

    // Register simple auth hook
    db.registerAuthHook('test-auth', (operation, table, data) => {
      return operation === 'read' || operation === 'insert'; // Allow reads and inserts only
    });

    // Insert encrypted data
    const result = await db.insert({ 
      id: 1, 
      api_key: 'secret-api-key-abc123',
      data: 'sensitive information'
    }, 'secrets');
    
    expect(result.id).toBe(1);

    // Retrieve and verify data is accessible
    const secrets = await db.getAll<{ api_key: string; data: string }>('secrets');
    expect(secrets).toHaveLength(1);
    expect(secrets[0].api_key).toBe('secret-api-key-abc123'); // Should be decrypted

    // Test authentication hook - should block deletes
    await expect(db.delete(1, 'secrets')).rejects.toThrow('Delete operation not authorized');

    // Remove auth hook and try again
    db.removeAuthHook('test-auth');
    await expect(db.delete(1, 'secrets')).resolves.not.toThrow();
  });
});