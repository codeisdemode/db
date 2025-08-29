import { BaseSyncAdapter, SyncOptions } from 'columnist-db-core';
import type { ConvexClient } from 'convex/browser';
export interface ConvexSyncOptions extends SyncOptions {
    db: any;
    convexClient: ConvexClient;
    mutationName?: string;
    queryName?: string;
}
export declare class ConvexSyncAdapter extends BaseSyncAdapter {
    private convexClient;
    private mutationName;
    private queryName;
    constructor(options: ConvexSyncOptions);
    initialize(): Promise<void>;
    pushChanges(changes: any): Promise<void>;
    pullChanges(): Promise<any>;
    protected setupRealtimeListeners(): Promise<void>;
    protected teardownRealtimeListeners(): void;
    private handleIncomingData;
    getStatus(): any;
}
//# sourceMappingURL=convex-adapter.d.ts.map