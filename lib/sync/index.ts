export * from './base-adapter';
export * from './types';

export { FirebaseSyncAdapter } from './adapters/firebase-adapter';
export { SupabaseSyncAdapter } from './adapters/supabase-adapter';
export { RESTfulSyncAdapter } from './adapters/rest-adapter';

import { ColumnistDB } from '../columnist';
import { BaseSyncAdapter, SyncOptions } from './base-adapter';

export class SyncManager {
  private adapters: Map<string, BaseSyncAdapter> = new Map();
  private db: ColumnistDB;

  constructor(db: ColumnistDB) {
    this.db = db;
  }

  /**
   * Register a sync adapter
   */
  registerAdapter(name: string, adapter: BaseSyncAdapter): void {
    this.adapters.set(name, adapter);
  }

  /**
   * Get a sync adapter by name
   */
  getAdapter(name: string): BaseSyncAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Get all registered adapters
   */
  getAllAdapters(): BaseSyncAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Remove a sync adapter
   */
  removeAdapter(name: string): void {
    const adapter = this.adapters.get(name);
    if (adapter) {
      adapter.dispose();
      this.adapters.delete(name);
    }
  }

  /**
   * Start all registered sync adapters
   */
  async startAll(): Promise<void> {
    const results = await Promise.allSettled(
      Array.from(this.adapters.values()).map(adapter => adapter.start())
    );

    const errors = results.filter(result => result.status === 'rejected');
    if (errors.length > 0) {
      console.warn('Some sync adapters failed to start:', errors);
    }
  }

  /**
   * Stop all sync adapters
   */
  stopAll(): void {
    for (const adapter of this.adapters.values()) {
      adapter.stop();
    }
  }

  /**
   * Get status of all sync adapters
   */
  getStatus(): Record<string, any> {
    const status: Record<string, any> = {};
    for (const [name, adapter] of this.adapters) {
      status[name] = adapter.getStatus();
    }
    return status;
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    this.stopAll();
    for (const adapter of this.adapters.values()) {
      adapter.dispose();
    }
    this.adapters.clear();
  }
}

/**
 * Helper function to create and register a sync adapter
 */
export function createSyncAdapter(
  db: ColumnistDB,
  type: 'firebase' | 'supabase' | 'rest',
  options: any & { name: string }
): BaseSyncAdapter {
  let adapter: BaseSyncAdapter;

  switch (type) {
    case 'firebase':
      const { FirebaseSyncAdapter } = require('./adapters/firebase-adapter');
      adapter = new FirebaseSyncAdapter(db, options);
      break;
    case 'supabase':
      const { SupabaseSyncAdapter } = require('./adapters/supabase-adapter');
      adapter = new SupabaseSyncAdapter(db, options);
      break;
    case 'rest':
      const { RESTfulSyncAdapter } = require('./adapters/rest-adapter');
      adapter = new RESTfulSyncAdapter(db, options);
      break;
    default:
      throw new Error(`Unsupported sync adapter type: ${type}`);
  }

  return adapter;
}