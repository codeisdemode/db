export * from './base-adapter';
export * from './types';
export { FirebaseSyncAdapter } from './adapters/firebase-adapter';
export { SupabaseSyncAdapter } from './adapters/supabase-adapter';
export { RESTfulSyncAdapter } from './adapters/rest-adapter';
import { ColumnistDB } from '../columnist';
import { BaseSyncAdapter } from './base-adapter';
export declare class SyncManager {
    private adapters;
    private db;
    constructor(db: ColumnistDB);
    /**
     * Register a sync adapter
     */
    registerAdapter(name: string, adapter: BaseSyncAdapter): void;
    /**
     * Get a sync adapter by name
     */
    getAdapter(name: string): BaseSyncAdapter | undefined;
    /**
     * Get all registered adapters
     */
    getAllAdapters(): BaseSyncAdapter[];
    /**
     * Remove a sync adapter
     */
    removeAdapter(name: string): void;
    /**
     * Start all registered sync adapters
     */
    startAll(): Promise<void>;
    /**
     * Stop all sync adapters
     */
    stopAll(): void;
    /**
     * Get status of all sync adapters
     */
    getStatus(): Record<string, any>;
    /**
     * Dispose all resources
     */
    dispose(): void;
}
/**
 * Helper function to create and register a sync adapter
 */
export declare function createSyncAdapter(db: ColumnistDB, type: 'firebase' | 'supabase' | 'rest', options: any & {
    name: string;
}): BaseSyncAdapter;
//# sourceMappingURL=index.d.ts.map