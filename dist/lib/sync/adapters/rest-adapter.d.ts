import { BaseSyncAdapter, SyncOptions, ChangeSet } from '../base-adapter';
import { ColumnistDB } from '../../columnist';
export interface RESTfulSyncConfig {
    /** Base URL of the REST API */
    baseURL: string;
    /** API endpoints configuration */
    endpoints?: {
        sync?: string;
        changes?: string;
        conflicts?: string;
    };
    /** Authentication configuration */
    auth?: {
        type: 'bearer' | 'basic' | 'api-key';
        token?: string;
        username?: string;
        password?: string;
        apiKey?: string;
        header?: string;
    };
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Additional headers */
    headers?: Record<string, string>;
}
export declare class RESTfulSyncAdapter extends BaseSyncAdapter {
    private config;
    private abortController;
    constructor(db: ColumnistDB, options: RESTfulSyncConfig & SyncOptions);
    initialize(): Promise<void>;
    pushChanges(changes: ChangeSet): Promise<void>;
    pullChanges(): Promise<ChangeSet>;
    protected setupRealtimeListeners(): Promise<void>;
    protected teardownRealtimeListeners(): void;
    private makeRequest;
    private buildHeaders;
    private normalizeChangeSet;
    dispose(): void;
}
//# sourceMappingURL=rest-adapter.d.ts.map