import { BaseSyncAdapter, SyncOptions, ChangeSet } from '../base-adapter';
import { ColumnistDB } from '../../columnist';
export interface SupabaseSyncConfig {
    supabaseUrl: string;
    supabaseKey: string;
    /** Schema name (default: 'public') */
    schema?: string;
    /** Table prefix (default: 'columnist_') */
    tablePrefix?: string;
    /** Authentication options */
    auth?: {
        autoRefreshToken?: boolean;
        persistSession?: boolean;
        detectSessionInUrl?: boolean;
    };
}
export declare class SupabaseSyncAdapter extends BaseSyncAdapter {
    private config;
    private supabase;
    private realtimeSubscription;
    constructor(db: ColumnistDB, options: SupabaseSyncConfig & SyncOptions);
    initialize(): Promise<void>;
    pushChanges(changes: ChangeSet): Promise<void>;
    pullChanges(): Promise<ChangeSet>;
    protected setupRealtimeListeners(): Promise<void>;
    protected teardownRealtimeListeners(): void;
    dispose(): void;
    /**
     * Calculate backoff time based on attempt number
     */
    private calculateBackoff;
    /**
     * Delay execution for specified milliseconds
     */
    private delay;
}
//# sourceMappingURL=supabase-adapter.d.ts.map