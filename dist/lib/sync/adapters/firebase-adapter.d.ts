import { BaseSyncAdapter, SyncOptions, ChangeSet } from '../base-adapter';
import { ColumnistDB } from '../../columnist';
export interface FirebaseSyncConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    databaseURL?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    /** Firebase collection prefix (default: 'columnist_') */
    collectionPrefix?: string;
    /** Authentication method */
    auth?: {
        email: string;
        password: string;
    } | {
        token: string;
    };
}
export declare class FirebaseSyncAdapter extends BaseSyncAdapter {
    private config;
    private firestore;
    private auth;
    private realtimeListeners;
    constructor(db: ColumnistDB, options: FirebaseSyncConfig & SyncOptions);
    initialize(): Promise<void>;
    pushChanges(changes: ChangeSet): Promise<void>;
    pullChanges(): Promise<ChangeSet>;
    protected setupRealtimeListeners(): Promise<void>;
    protected teardownRealtimeListeners(): void;
    dispose(): void;
}
//# sourceMappingURL=firebase-adapter.d.ts.map