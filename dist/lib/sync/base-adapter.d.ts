import { ColumnistDB } from '../columnist';
export interface SyncOptions {
    /** Sync interval in milliseconds (default: 5000) */
    interval?: number;
    /** Whether to enable real-time sync (default: false) */
    realtime?: boolean;
    /** Conflict resolution strategy (default: 'local-wins') */
    conflictStrategy?: 'local-wins' | 'remote-wins' | 'merge' | 'custom' | 'device-aware';
    /** Custom conflict resolver function */
    conflictResolver?: (local: any, remote: any) => any;
    /** Tables to sync (default: all tables) */
    tables?: string[];
    /** Maximum retry attempts for failed syncs (default: 3) */
    maxRetries?: number;
    /** Backoff strategy for retries (default: exponential) */
    backoffStrategy?: 'exponential' | 'linear' | 'fixed';
}
export interface SyncStatus {
    status: 'idle' | 'syncing' | 'error' | 'offline';
    lastSync?: Date;
    error?: string;
    pendingChanges: number;
    tables: Record<string, TableSyncStatus>;
}
export interface TableSyncStatus {
    synced: number;
    pending: number;
    lastSync?: Date;
    error?: string;
}
export interface SyncEvent {
    type: 'sync-start' | 'sync-complete' | 'sync-error' | 'conflict' | 'change-detected';
    table?: string;
    data?: any;
    error?: Error;
}
export interface ChangeSet {
    inserts: any[];
    updates: any[];
    deletes: number[];
    timestamp: Date;
}
export declare abstract class BaseSyncAdapter {
    protected db: ColumnistDB;
    protected options: SyncOptions;
    protected status: SyncStatus;
    protected syncInterval?: NodeJS.Timeout;
    protected pendingChanges: Map<string, ChangeSet>;
    protected listeners: Set<(event: SyncEvent) => void>;
    protected deviceManager: import('./device-utils').DeviceManager;
    constructor(db: ColumnistDB, options?: SyncOptions);
    /**
     * Initialize the sync adapter
     */
    abstract initialize(): Promise<void>;
    /**
     * Push local changes to remote
     */
    abstract pushChanges(changes: ChangeSet): Promise<void>;
    /**
     * Pull remote changes
     */
    abstract pullChanges(): Promise<ChangeSet>;
    /**
     * Start synchronization
     */
    start(): Promise<void>;
    /**
     * Stop synchronization
     */
    stop(): void;
    /**
     * Perform a sync operation
     */
    protected sync(): Promise<void>;
    /**
     * Setup real-time change listeners
     */
    protected abstract setupRealtimeListeners(): Promise<void>;
    /**
     * Teardown real-time listeners
     */
    protected abstract teardownRealtimeListeners(): void;
    /**
     * Collect local changes that need to be synced
     */
    protected collectLocalChanges(): ChangeSet;
    /**
     * Clear applied local changes
     */
    protected clearLocalChanges(appliedChanges: ChangeSet): void;
    /**
     * Apply remote changes to local database
     */
    protected applyRemoteChanges(changes: ChangeSet): Promise<void>;
    /**
     * Resolve conflicts between local and remote changes
     */
    protected resolveConflict(local: any, remote: any): any;
    /**
     * Device-aware conflict resolution that considers device online status
     */
    protected resolveDeviceAwareConflict(local: any, remote: any): Promise<any>;
    /**
     * Timestamp-based conflict resolution (fallback)
     */
    protected resolveTimestampConflict(local: any, remote: any): any;
    /**
     * Extract timestamp from record using common field patterns
     */
    protected getRecordTimestamp(record: any): number | null;
    /**
     * Smart merge strategy that handles common conflict scenarios
     */
    protected mergeRecords(local: any, remote: any): any;
    /**
     * Detect if two records have conflicting changes
     */
    protected hasConflict(local: any, remote: any): boolean;
    /**
     * Track local changes for synchronization
     */
    trackChange(table: string, type: 'insert' | 'update' | 'delete', record: any): void;
    /**
     * Get current sync status
     */
    getStatus(): SyncStatus;
    /**
     * Add sync event listener
     */
    onSyncEvent(listener: (event: SyncEvent) => void): () => void;
    /**
     * Emit sync event
     */
    protected emit(event: SyncEvent): void;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
//# sourceMappingURL=base-adapter.d.ts.map