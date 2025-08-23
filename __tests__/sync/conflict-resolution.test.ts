import { BaseSyncAdapter, SyncOptions } from '../../lib/sync/base-adapter';
import { Columnist, defineTable } from '../../lib/columnist';

// Mock implementation for conflict testing
class ConflictTestAdapter extends BaseSyncAdapter {
  async initialize(): Promise<void> {}
  async pushChanges(): Promise<void> {}
  async pullChanges(): Promise<any> {
    return { inserts: [], updates: [], deletes: [], timestamp: new Date() };
  }
  protected async setupRealtimeListeners(): Promise<void> {}
  protected teardownRealtimeListeners(): void {}
}

describe('Conflict Resolution', () => {
  let db: any;
  
  beforeEach(async () => {
    const schema = {
      users: defineTable()
        .column('id', 'number')
        .column('name', 'string')
        .column('email', 'string')
        .column('_lastModified', 'string')
        .column('_version', 'number')
        .primaryKey('id')
        .build()
    };

    db = await Columnist.init('test-conflict-db', { schema, version: 1 });
  });

  afterEach(async () => {
    // No close method needed
  });

  test('should detect timestamp-based conflicts', () => {
    const options: SyncOptions = { conflictStrategy: 'local-wins' };
    const adapter = new ConflictTestAdapter(db, options);
    
    const now = new Date();
    const fiveSecondsAgo = new Date(now.getTime() - 5000);
    const twoSecondsAgo = new Date(now.getTime() - 2000);
    
    // Records modified within 5 seconds - should be considered conflicting
    const local = { id: 1, name: 'Local', _lastModified: twoSecondsAgo.toISOString() };
    const remote = { id: 1, name: 'Remote', _lastModified: now.toISOString() };
    
    const hasConflict = (adapter as any).hasConflict(local, remote);
    expect(hasConflict).toBe(true);
    
    adapter.dispose();
  });

  test('should not detect conflicts for distant timestamps', () => {
    const options: SyncOptions = { conflictStrategy: 'local-wins' };
    const adapter = new ConflictTestAdapter(db, options);
    
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    // Records modified more than 5 seconds apart - no conflict
    const local = { id: 1, name: 'Local', _lastModified: oneMinuteAgo.toISOString() };
    const remote = { id: 1, name: 'Remote', _lastModified: now.toISOString() };
    
    const hasConflict = (adapter as any).hasConflict(local, remote);
    expect(hasConflict).toBe(false);
    
    adapter.dispose();
  });

  test('should detect version-based conflicts', () => {
    const options: SyncOptions = { conflictStrategy: 'local-wins' };
    const adapter = new ConflictTestAdapter(db, options);
    
    // Same version numbers indicate conflict
    const local = { id: 1, name: 'Local', _version: 5 };
    const remote = { id: 1, name: 'Remote', _version: 5 };
    
    const hasConflict = (adapter as any).hasConflict(local, remote);
    expect(hasConflict).toBe(true);
    
    adapter.dispose();
  });

  test('should not detect conflicts for different versions', () => {
    const options: SyncOptions = { conflictStrategy: 'local-wins' };
    const adapter = new ConflictTestAdapter(db, options);
    
    // Different version numbers - no conflict
    const local = { id: 1, name: 'Local', _version: 5 };
    const remote = { id: 1, name: 'Remote', _version: 6 };
    
    const hasConflict = (adapter as any).hasConflict(local, remote);
    expect(hasConflict).toBe(false);
    
    adapter.dispose();
  });

  test('should merge records with latest timestamp winning', () => {
    const options: SyncOptions = { conflictStrategy: 'merge' };
    const adapter = new ConflictTestAdapter(db, options);
    
    const local = { 
      id: 1, 
      name: 'Local', 
      email: 'local@example.com',
      _lastModified: '2024-01-01T10:00:00Z'
    };
    
    const remote = { 
      id: 1, 
      name: 'Remote', 
      age: 25,
      _lastModified: '2024-01-01T12:00:00Z' // Later timestamp
    };
    
    const result = (adapter as any).resolveConflict(local, remote);
    
    // Remote timestamp is later, so remote name should win
    expect(result.name).toBe('Remote');
    // Local email should be preserved
    expect(result.email).toBe('local@example.com');
    // Remote age should be added
    expect(result.age).toBe(25);
    // Should be marked as merged
    expect(result._merged).toBe(true);
    
    adapter.dispose();
  });

  test('should merge records with higher version winning', () => {
    const options: SyncOptions = { conflictStrategy: 'merge' };
    const adapter = new ConflictTestAdapter(db, options);
    
    const local = { 
      id: 1, 
      name: 'Local', 
      email: 'local@example.com',
      _version: 2
    };
    
    const remote = { 
      id: 1, 
      name: 'Remote', 
      age: 25,
      _version: 3 // Higher version
    };
    
    const result = (adapter as any).resolveConflict(local, remote);
    
    // Remote has higher version, so remote name should win
    expect(result.name).toBe('Remote');
    // Local email should be preserved
    expect(result.email).toBe('local@example.com');
    // Remote age should be added
    expect(result.age).toBe(25);
    // Version should be the maximum
    expect(result._version).toBe(3);
    
    adapter.dispose();
  });

  test('should handle complex merge scenarios', () => {
    const options: SyncOptions = { conflictStrategy: 'merge' };
    const adapter = new ConflictTestAdapter(db, options);
    
    const local = { 
      id: 1, 
      name: 'Local User',
      email: 'local@example.com',
      preferences: { theme: 'dark', notifications: true },
      _lastModified: '2024-01-01T10:00:00Z',
      _version: 2
    };
    
    const remote = { 
      id: 1, 
      name: 'Remote User',
      age: 30,
      preferences: { theme: 'light', language: 'en' },
      _lastModified: '2024-01-01T09:00:00Z', // Earlier timestamp
      _version: 3 // But higher version
    };
    
    const result = (adapter as any).resolveConflict(local, remote);
    
    // Version takes precedence over timestamp, so remote name wins
    expect(result.name).toBe('Remote User');
    // Local email preserved
    expect(result.email).toBe('local@example.com');
    // Remote age added
    expect(result.age).toBe(30);
    // Preferences should be merged (shallow merge - remote overwrites local)
    expect(result.preferences.theme).toBe('light'); // Remote wins for theme
    expect(result.preferences.notifications).toBeUndefined(); // Local preferences overwritten
    expect(result.preferences.language).toBe('en'); // Remote added
    // Version should be the maximum
    expect(result._version).toBe(3);
    
    adapter.dispose();
  });

  test('should use custom conflict resolver', () => {
    const customResolver = (local: any, remote: any) => ({
      ...local,
      ...remote,
      resolvedBy: 'custom',
      mergedAt: new Date().toISOString()
    });
    
    const options: SyncOptions = { 
      conflictStrategy: 'custom', 
      conflictResolver: customResolver 
    };
    
    const adapter = new ConflictTestAdapter(db, options);
    
    const local = { id: 1, name: 'Local' };
    const remote = { id: 1, email: 'remote@example.com' };
    
    const result = (adapter as any).resolveConflict(local, remote);
    
    expect(result.resolvedBy).toBe('custom');
    expect(result.mergedAt).toBeDefined();
    expect(result.name).toBe('Local');
    expect(result.email).toBe('remote@example.com');
    
    adapter.dispose();
  });

  test('should fallback to local-wins when custom resolver missing', () => {
    const options: SyncOptions = { 
      conflictStrategy: 'custom'
      // No conflictResolver provided
    };
    
    const adapter = new ConflictTestAdapter(db, options);
    
    const local = { id: 1, name: 'Local' };
    const remote = { id: 1, name: 'Remote' };
    
    const result = (adapter as any).resolveConflict(local, remote);
    
    // Should fallback to local-wins
    expect(result.name).toBe('Local');
    
    adapter.dispose();
  });

  test('should handle null or undefined records', () => {
    const options: SyncOptions = { conflictStrategy: 'local-wins' };
    const adapter = new ConflictTestAdapter(db, options);
    
    // Test with null/undefined values
    expect((adapter as any).hasConflict(null, {})).toBe(false);
    expect((adapter as any).hasConflict({}, null)).toBe(false);
    expect((adapter as any).hasConflict(undefined, {})).toBe(false);
    
    adapter.dispose();
  });

  test('should emit conflict events', (done) => {
    const options: SyncOptions = { conflictStrategy: 'local-wins' };
    const adapter = new ConflictTestAdapter(db, options);
    
    const unsubscribe = adapter.onSyncEvent((event: any) => {
      if (event.type === 'conflict') {
        expect(event.data.local).toBeDefined();
        expect(event.data.remote).toBeDefined();
        unsubscribe();
        done();
      }
    });
    
    // Trigger a conflict resolution
    (adapter as any).resolveConflict(
      { id: 1, name: 'Local' },
      { id: 1, name: 'Remote' }
    );
    
    adapter.dispose();
  });
});