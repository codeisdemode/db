import { RESTfulSyncAdapter, RESTfulSyncConfig } from '../../lib/sync/adapters/rest-adapter';
import { Columnist, defineTable } from '../../lib/columnist';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('RESTfulSyncAdapter', () => {
  let db: any;
  let adapter: RESTfulSyncAdapter;
  
  beforeEach(async () => {
    const schema = {
      users: defineTable()
        .column('id', 'number')
        .column('name', 'string')
        .column('email', 'string')
        .primaryKey('id')
        .build()
    };

    db = await Columnist.init('test-rest-sync-db', { schema, version: 1 });
    
    const config: RESTfulSyncConfig = {
      baseURL: 'https://api.example.com',
      auth: {
        type: 'bearer',
        token: 'test-token'
      }
    };
    
    adapter = new RESTfulSyncAdapter(db, config);
    mockFetch.mockClear();
  });

  afterEach(async () => {
    await adapter.dispose();
  });

  test('should initialize with valid configuration', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ status: 'ok' })
    });

    await adapter.initialize();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/health',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        })
      })
    );
  });

  test('should throw error for invalid configuration', async () => {
    const invalidAdapter = new RESTfulSyncAdapter(db, { baseURL: '' } as any);
    await expect(invalidAdapter.initialize()).rejects.toThrow('baseURL is required');
    invalidAdapter.dispose();
  });

  test('should push changes to REST API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: true })
    });

    const changes = {
      inserts: [{ id: 1, name: 'Test', email: 'test@example.com', _table: 'users' }],
      updates: [{ id: 2, name: 'Updated', email: 'updated@example.com', _table: 'users' }],
      deletes: [3],
      timestamp: new Date()
    };

    await adapter.pushChanges(changes);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/sync/changes',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"source":"columnist"')
      })
    );
  });

  test('should pull changes from REST API', async () => {
    const mockChanges = {
      inserts: [{ id: 4, name: 'Remote', email: 'remote@example.com' }],
      updates: [{ id: 5, name: 'Remote Updated', email: 'remote-updated@example.com' }],
      deletes: [6],
      timestamp: new Date().toISOString()
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(mockChanges)
    });

    const changes = await adapter.pullChanges();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/sync/changes',
      expect.objectContaining({
        method: 'GET'
      })
    );

    expect(changes.inserts).toEqual(mockChanges.inserts);
    expect(changes.updates).toEqual(mockChanges.updates);
    expect(changes.deletes).toEqual(mockChanges.deletes);
  });

  test('should handle empty response from pullChanges', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(null)
    });

    const changes = await adapter.pullChanges();
    expect(changes).toEqual({
      inserts: [],
      updates: [],
      deletes: [],
      timestamp: expect.any(Date)
    });
  });

  test('should handle HTTP errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await expect(adapter.pushChanges({
      inserts: [], updates: [], deletes: [], timestamp: new Date()
    })).rejects.toThrow('HTTP 500: Internal Server Error');
  });

  test('should handle request timeouts', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 100)
      )
    );

    await expect(adapter.pushChanges({
      inserts: [], updates: [], deletes: [], timestamp: new Date()
    })).rejects.toThrow('Request timeout');
  });

  test('should support different authentication types', async () => {
    const basicAuthAdapter = new RESTfulSyncAdapter(db, {
      baseURL: 'https://api.example.com',
      auth: {
        type: 'basic',
        username: 'user',
        password: 'pass'
      }
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ status: 'ok' })
    });

    await basicAuthAdapter.initialize();
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Basic dXNlcjpwYXNz' // base64 encoded 'user:pass'
        })
      })
    );

    basicAuthAdapter.dispose();
  });

  test('should support API key authentication', async () => {
    const apiKeyAdapter = new RESTfulSyncAdapter(db, {
      baseURL: 'https://api.example.com',
      auth: {
        type: 'api-key',
        apiKey: 'test-api-key',
        header: 'X-API-Key'
      }
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ status: 'ok' })
    });

    await apiKeyAdapter.initialize();
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-API-Key': 'test-api-key'
        })
      })
    );

    apiKeyAdapter.dispose();
  });

  test('should handle real-time mode warning', async () => {
    const realtimeAdapter = new RESTfulSyncAdapter(db, {
      baseURL: 'https://api.example.com',
      realtime: true
    } as any);

    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    await (realtimeAdapter as any).setupRealtimeListeners();
    
    expect(consoleWarn).toHaveBeenCalledWith(
      'Real-time listening not supported for REST adapter. Use WebSocket adapter for real-time features.'
    );
    
    consoleWarn.mockRestore();
    realtimeAdapter.dispose();
  });
});