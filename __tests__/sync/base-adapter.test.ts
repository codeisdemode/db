import { BaseSyncAdapter, SyncOptions, ChangeSet, SyncEvent } from '../../lib/sync/base-adapter';
import { Columnist, defineTable } from '../../lib/columnist';

// Mock implementation for testing
class TestSyncAdapter extends BaseSyncAdapter {
  async initialize(): Promise<void> {}
  async pushChanges(changes: ChangeSet): Promise<void> {}
  async pullChanges(): Promise<ChangeSet> {
    return { inserts: [], updates: [], deletes: [], timestamp: new Date() };
  }
  protected async setupRealtimeListeners(): Promise<void> {}
  protected teardownRealtimeListeners(): void {}
}

describe('BaseSyncAdapter', () => {
  let db: any;
  let adapter: TestSyncAdapter;
  
  beforeEach(async () => {
    const schema = {
      users: defineTable()
        .column('id', 'number')
        .column('name', 'string')
        .column('email', 'string')
        .primaryKey('id')
        .build()
    };

    db = await Columnist.init('test-sync-db', { schema, version: 1 });
    
    const options: SyncOptions = {
      interval: 1000,
      realtime: false,
      conflictStrategy: 'local-wins'
    };
    
    adapter = new TestSyncAdapter(db, options);
  });

  afterEach(async () => {
    await adapter.dispose();
  });

  test('should initialize with default options', () => {
    expect(adapter.getStatus().status).toBe('idle');
    expect(adapter.getStatus().pendingChanges).toBe(0);
  });

  test('should track insert changes', () => {
    const record = { id: 1, name: 'Test', email: 'test@example.com' };
    adapter.trackChange('users', 'insert', record);
    
    const status = adapter.getStatus();
    expect(status.pendingChanges).toBe(1);
    expect(status.pendingChanges).toBe(1);
  });

  test('should track update changes', () => {
    const record = { id: 1, name: 'Updated', email: 'updated@example.com' };
    adapter.trackChange('users', 'update', record);
    
    const status = adapter.getStatus();
    expect(status.pendingChanges).toBe(1);
  });

  test('should track delete changes', () => {
    adapter.trackChange('users', 'delete', { id: 1 });
    
    const status = adapter.getStatus();
    expect(status.pendingChanges).toBe(1);
  });

  test('should collect local changes', () => {
    const insertRecord = { id: 1, name: 'Test', email: 'test@example.com' };
    const updateRecord = { id: 2, name: 'Updated', email: 'updated@example.com' };
    
    adapter.trackChange('users', 'insert', insertRecord);
    adapter.trackChange('users', 'update', updateRecord);
    adapter.trackChange('users', 'delete', { id: 3 });
    
    const changes = (adapter as any).collectLocalChanges();
    
    expect(changes.inserts).toHaveLength(1);
    expect(changes.updates).toHaveLength(1);
    expect(changes.deletes).toHaveLength(1);
    expect(changes.inserts[0]._table).toBe('users');
  });

  test('should clear local changes', () => {
    adapter.trackChange('users', 'insert', { id: 1, name: 'Test' });
    
    const changes = (adapter as any).collectLocalChanges();
    (adapter as any).clearLocalChanges(changes);
    
    const status = adapter.getStatus();
    expect(status.pendingChanges).toBe(0);
  });

  test('should resolve conflicts with local-wins strategy', () => {
    const local = { id: 1, name: 'Local', email: 'local@example.com' };
    const remote = { id: 1, name: 'Remote', email: 'remote@example.com' };
    
    const result = (adapter as any).resolveConflict(local, remote);
    expect(result).toEqual(local);
  });

  test('should resolve conflicts with remote-wins strategy', () => {
    const options: SyncOptions = { conflictStrategy: 'remote-wins' };
    const adapterWithRemoteWins = new TestSyncAdapter(db, options);
    
    const local = { id: 1, name: 'Local', email: 'local@example.com' };
    const remote = { id: 1, name: 'Remote', email: 'remote@example.com' };
    
    const result = (adapterWithRemoteWins as any).resolveConflict(local, remote);
    expect(result).toEqual(remote);
    
    adapterWithRemoteWins.dispose();
  });

  test('should merge records with merge strategy', () => {
    const options: SyncOptions = { conflictStrategy: 'merge' };
    const adapterWithMerge = new TestSyncAdapter(db, options);
    
    const local = { id: 1, name: 'Local', email: 'local@example.com', _lastModified: '2024-01-01' };
    const remote = { id: 1, name: 'Remote', age: 25, _lastModified: '2024-01-02' };
    
    const result = (adapterWithMerge as any).resolveConflict(local, remote);
    expect(result.name).toBe('Remote'); // Remote wins for name
    expect(result.email).toBe('local@example.com'); // Local keeps email
    expect(result.age).toBe(25); // Remote adds age
    expect(result._merged).toBe(true);
    
    adapterWithMerge.dispose();
  });

  test('should use custom conflict resolver', () => {
    const customResolver = (local: any, remote: any) => ({ ...local, ...remote, resolved: true });
    const options: SyncOptions = { 
      conflictStrategy: 'custom', 
      conflictResolver: customResolver 
    };
    const adapterWithCustom = new TestSyncAdapter(db, options);
    
    const local = { id: 1, name: 'Local' };
    const remote = { id: 1, email: 'remote@example.com' };
    
    const result = (adapterWithCustom as any).resolveConflict(local, remote);
    expect(result.resolved).toBe(true);
    expect(result.name).toBe('Local');
    expect(result.email).toBe('remote@example.com');
    
    adapterWithCustom.dispose();
  });

  test('should detect conflicts based on timestamps', () => {
    const local = { id: 1, name: 'Local', _lastModified: new Date().toISOString() };
    const remote = { id: 1, name: 'Remote', _lastModified: new Date(Date.now() - 2000).toISOString() };
    
    const hasConflict = (adapter as any).hasConflict(local, remote);
    expect(hasConflict).toBe(true); // 2 second difference, within 5-second conflict window
  });

  test('should emit sync events', (done) => {
    const unsubscribe = adapter.onSyncEvent((event: SyncEvent) => {
      if (event.type === 'change-detected') {
        expect(event.table).toBe('users');
        unsubscribe();
        done();
      }
    });
    
    adapter.trackChange('users', 'insert', { id: 1, name: 'Test' });
  });

  test('should start and stop synchronization', async () => {
    // Mock the sync method to avoid actual network calls
    const syncSpy = jest.spyOn(adapter as any, 'sync').mockResolvedValue(undefined);
    
    await adapter.start();
    expect(adapter.getStatus().status).toBe('idle');
    
    adapter.stop();
    expect(adapter.getStatus().status).toBe('idle');
    
    syncSpy.mockRestore();
  });
});