import { z } from "zod";
import { SyncManager } from "./sync";
type ColumnType = "string" | "number" | "boolean" | "date" | "json";
export interface TableDefinition {
    columns: Record<string, ColumnType>;
    primaryKey?: string;
    searchableFields?: string[];
    secondaryIndexes?: string[];
    validation?: z.ZodSchema;
    vector?: {
        field: string;
        dims: number;
    };
}
export type InferTableType<T extends TableDefinition> = {
    [K in keyof T["columns"]]: T["columns"][K] extends "string" ? string : T["columns"][K] extends "number" ? number : T["columns"][K] extends "boolean" ? boolean : T["columns"][K] extends "date" ? Date : T["columns"][K] extends "json" ? unknown : never;
} & {
    id: number;
};
export declare class TableSchemaBuilder<T extends Record<string, ColumnType> = {}> {
    private def;
    column<K extends string, V extends ColumnType>(name: K, type: V): TableSchemaBuilder<T & Record<K, V>>;
    primaryKey(field: keyof T): this;
    searchable(...fields: (keyof T)[]): this;
    indexes(...fields: (keyof T)[]): this;
    validate(schema: z.ZodSchema): this;
    vector(config: {
        field: string;
        dims: number;
    }): this;
    build(): TableDefinition & {
        columns: T;
    };
}
export declare function defineTable(): TableSchemaBuilder;
export type SchemaDefinition = Record<string, TableDefinition>;
export declare const DeviceTableSchema: TableDefinition;
export interface SearchOptions {
    table?: string;
    limit?: number;
    timeRange?: [Date | string, Date | string];
    [key: string]: unknown;
}
export interface WhereCondition {
    [field: string]: unknown | {
        $gt?: unknown;
        $gte?: unknown;
        $lt?: unknown;
        $lte?: unknown;
        $in?: unknown[];
    };
}
export interface FindOptions {
    table?: string;
    where?: WhereCondition;
    orderBy?: string | {
        field: string;
        direction?: "asc" | "desc";
    };
    limit?: number;
    offset?: number;
}
export interface InsertResult {
    id: number;
}
export interface BulkOperationResult {
    success: number;
    errors: Array<{
        error: Error;
        record: any;
    }>;
}
interface TableStats {
    count: number;
    totalBytes: number;
}
interface ChangeEvent<T = unknown> {
    table: string;
    type: "insert" | "update" | "delete";
    record: T & {
        id: number;
    };
    oldRecord?: T & {
        id: number;
    };
}
type Subscriber = (event: ChangeEvent) => void;
export interface TypedColumnistDB<Schema extends SchemaDefinition> {
    insert<K extends keyof Schema>(record: Omit<InferTableType<Schema[K]>, "id">, table: K): Promise<InsertResult>;
    update<K extends keyof Schema>(id: number, updates: Partial<Omit<InferTableType<Schema[K]>, "id">>, table: K): Promise<void>;
    bulkInsert<K extends keyof Schema>(records: Omit<InferTableType<Schema[K]>, "id">[], table: K): Promise<BulkOperationResult>;
    bulkUpdate<K extends keyof Schema>(updates: Array<{
        id: number;
        updates: Partial<Omit<InferTableType<Schema[K]>, "id">>;
    }>, table: K): Promise<BulkOperationResult>;
    bulkDelete<K extends keyof Schema>(ids: number[], table: K): Promise<BulkOperationResult>;
    find<K extends keyof Schema>(options: Omit<FindOptions, "table"> & {
        table: K;
    }): Promise<InferTableType<Schema[K]>[]>;
    search<K extends keyof Schema>(query: string, options: Omit<SearchOptions, "table"> & {
        table: K;
    }): Promise<(InferTableType<Schema[K]> & {
        score: number;
    })[]>;
    getAll<K extends keyof Schema>(table: K, limit?: number): Promise<InferTableType<Schema[K]>[]>;
}
export declare class ColumnistDB<Schema extends SchemaDefinition = SchemaDefinition> {
    #private;
    private name;
    private version;
    private schema;
    private db;
    private subscribers;
    private vectorEmbedders;
    private migrations?;
    private vectorCache;
    private encryptionKey;
    private authHooks;
    private syncManager;
    private constructor();
    static init(name: string, opts?: {
        schema?: SchemaDefinition;
        version?: number;
        migrations?: Record<number, (db: IDBDatabase, tx: IDBTransaction, oldVersion: number) => void>;
        encryptionKey?: string;
    }): Promise<ColumnistDB>;
    static getDB(): ColumnistDB;
    defineSchema(schema: SchemaDefinition, version?: number): void;
    getSchema(): SchemaDefinition;
    load(): Promise<void>;
    private validateRecord;
    private generateAutoSchema;
    update<T extends Record<string, unknown>>(id: number, updates: Partial<T>, table?: string): Promise<void>;
    delete(id: number, table?: string): Promise<void>;
    upsert<T extends Record<string, unknown>>(record: T, table?: string): Promise<InsertResult>;
    /**
     * Bulk insert multiple records with optimized performance
     */
    bulkInsert<T extends Record<string, unknown>>(records: T[], table?: string): Promise<BulkOperationResult>;
    /**
     * Bulk update multiple records with optimized performance
     */
    bulkUpdate<T extends Record<string, unknown>>(updates: Array<{
        id: number;
        updates: Partial<T>;
    }>, table?: string): Promise<BulkOperationResult>;
    /**
     * Bulk delete multiple records with optimized performance
     */
    bulkDelete(ids: number[], table?: string): Promise<BulkOperationResult>;
    insert<T extends Record<string, unknown>>(record: T, table?: string): Promise<InsertResult>;
    getAll<T = unknown>(table: string, limit?: number): Promise<(T & {
        id: number;
    })[]>;
    find<T = any>(options?: FindOptions): Promise<(T & {
        id: number;
    })[]>;
    search<T = any>(query: string, options?: SearchOptions): Promise<(T & {
        id: number;
        score: number;
    })[]>;
    registerEmbedder(table: string, embedder: (input: string) => Promise<Float32Array>): void;
    securityAudit(): Promise<{
        issues: string[];
        recommendations: string[];
    }>;
    setEncryptionKey(key: string): Promise<void>;
    private encryptData;
    private decryptData;
    private encryptSensitiveFields;
    private decryptSensitiveFields;
    registerAuthHook(name: string, hook: (operation: string, table: string, data?: any) => boolean): void;
    removeAuthHook(name: string): void;
    private checkAuth;
    buildIVFIndex(table: string, numCentroids?: number): Promise<void>;
    private euclideanDistance;
    private cacheVector;
    private getCachedVector;
    vectorSearchText<T = any>(table: string, queryText: string, opts?: {
        metric?: "cosine" | "dot" | "euclidean";
        limit?: number;
        where?: WhereCondition;
    }): Promise<(T & {
        id: number;
        score: number;
    })[]>;
    vectorSearch<T = any>(table: string, inputVector: Float32Array, opts?: {
        metric?: "cosine" | "dot" | "euclidean";
        limit?: number;
        where?: WhereCondition;
        useIVF?: boolean;
    }): Promise<(T & {
        id: number;
        score: number;
    })[]>;
    export(options?: {
        tables?: string[];
    }): Promise<Record<string, unknown[]>>;
    import(data: Record<string, unknown[]>, mode?: "merge" | "replace"): Promise<void>;
    findPage<T = any>(options: FindOptions & {
        cursor?: string;
    }): Promise<{
        data: (T & {
            id: number;
        })[];
        nextCursor: string | null;
    }>;
    transaction(work: (tx: {
        insert: <T extends Record<string, unknown>>(record: T, table?: string) => Promise<InsertResult>;
    }) => Promise<void>): Promise<void>;
    getStats(table?: string): Promise<{
        totalTables: number;
        tables: Record<string, TableStats>;
        overallBytes: number;
    } | TableStats>;
    subscribe(table: string, fn: Subscriber): () => void;
    typed<S extends Schema = Schema>(): TypedColumnistDB<S>;
    getSyncManager(): SyncManager;
    getDeviceManager(): Promise<import('./sync/device-utils').DeviceManager>;
    registerSyncAdapter(name: string, type: 'firebase' | 'supabase' | 'rest', options: any): Promise<void>;
    startSync(name?: string): Promise<void>;
    stopSync(name?: string): void;
    getSyncStatus(name?: string): any;
    /**
     * Track database changes for synchronization
     */
    private trackSyncChange;
    getCurrentDevice(): Promise<import('./sync/device-utils').DeviceInfo>;
    getAllDevices(): Promise<import('./sync/device-utils').DeviceInfo[]>;
    getOnlineDevices(): Promise<import('./sync/device-utils').DeviceInfo[]>;
    startDevicePresenceTracking(heartbeatInterval?: number): Promise<void>;
    private notify;
    private ensureDb;
    private ensureTable;
    private collectAllIds;
    private passesFilters;
    private passesTimeRange;
    private allStoreNamesForTx;
    private hasIndex;
    private buildKeyRange;
    private matchesWhere;
    private matchesCondition;
}
export declare const Columnist: {
    init: typeof ColumnistDB.init;
    getDB: typeof ColumnistDB.getDB;
};
export default Columnist;
//# sourceMappingURL=columnist.d.ts.map