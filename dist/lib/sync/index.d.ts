export * from './base-adapter';
export * from './types';
export type { FirebaseSyncAdapter } from './adapters/firebase-adapter';
export type { SupabaseSyncAdapter } from './adapters/supabase-adapter';
export type { RESTfulSyncAdapter } from './adapters/rest-adapter';
import { ColumnistDB } from '../columnist';
import { BaseSyncAdapter } from './base-adapter';
export declare class SyncManager {
    private adapters;
    private db;
    private deviceManager;
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
     * Get device manager instance
     */
    getDeviceManager(): import('./device-utils').DeviceManager;
    /**
     * Get online devices across all sync adapters
     */
    getOnlineDevices(): Promise<import('./device-utils').DeviceInfo[]>;
    /**
     * Get device status
     */
    getDeviceStatus(deviceId: string): Promise<'online' | 'offline'>;
    /**
     * Start device presence tracking
     */
    startDevicePresenceTracking(heartbeatInterval?: number): Promise<void>;
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