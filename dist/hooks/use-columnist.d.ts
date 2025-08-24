import { ColumnistDB, type SchemaDefinition, type FindOptions, type SearchOptions, type InsertResult } from "@/lib/columnist";
export interface UseColumnistOptions {
    name: string;
    schema?: SchemaDefinition;
    version?: number;
}
export interface UseColumnistResult<Schema extends SchemaDefinition = SchemaDefinition> {
    db: ColumnistDB<Schema> | null;
    isLoading: boolean;
    error: Error | null;
    insert: <T extends Record<string, unknown>>(record: T, table?: string) => Promise<InsertResult>;
    update: <T extends Record<string, unknown>>(id: number, updates: Partial<T>, table?: string) => Promise<void>;
    delete: (id: number, table?: string) => Promise<void>;
    upsert: <T extends Record<string, unknown>>(record: T, table?: string) => Promise<InsertResult>;
    find: <T = any>(options?: FindOptions) => Promise<(T & {
        id: number;
    })[]>;
    search: <T = any>(query: string, options?: SearchOptions) => Promise<(T & {
        id: number;
        score: number;
    })[]>;
    getAll: <T = unknown>(table: string, limit?: number) => Promise<(T & {
        id: number;
    })[]>;
    getStats: (table?: string) => Promise<any>;
    subscribe: (table: string, fn: (event: any) => void) => () => void;
    transaction: (work: (tx: any) => Promise<void>) => Promise<void>;
}
/**
 * React hook for managing a Columnist database instance
 *
 * @example
 * ```tsx
 * const { db, insert, find, isLoading, error } = useColumnist({
 *   name: "my-app",
 *   schema: {
 *     messages: {
 *       columns: { id: "number", text: "string", timestamp: "date" },
 *       searchableFields: ["text"]
 *     }
 *   }
 * })
 *
 * // Use convenience methods
 * await insert({ text: "Hello", timestamp: new Date() })
 * const messages = await find({ table: "messages", orderBy: "timestamp" })
 * ```
 */
export declare function useColumnist<Schema extends SchemaDefinition = SchemaDefinition>(options: UseColumnistOptions): UseColumnistResult<Schema>;
//# sourceMappingURL=use-columnist.d.ts.map