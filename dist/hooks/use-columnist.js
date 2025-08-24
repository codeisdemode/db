"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useColumnist = useColumnist;
const react_1 = require("react");
const columnist_1 = require("@/lib/columnist");
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
function useColumnist(options) {
    const [db, setDb] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    // Initialize database
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        async function initDb() {
            try {
                setIsLoading(true);
                setError(null);
                const instance = await columnist_1.ColumnistDB.init(options.name, {
                    schema: options.schema,
                    version: options.version
                });
                if (!cancelled) {
                    setDb(instance);
                }
            }
            catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error("Failed to initialize database"));
                }
            }
            finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }
        initDb();
        return () => {
            cancelled = true;
        };
    }, [options.name, options.schema, options.version]);
    // Convenience method factories that use the current db instance
    const insert = (0, react_1.useCallback)(async (record, table) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.insert(record, table);
    }, [db]);
    const update = (0, react_1.useCallback)(async (id, updates, table) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.update(id, updates, table);
    }, [db]);
    const deleteRecord = (0, react_1.useCallback)(async (id, table) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.delete(id, table);
    }, [db]);
    const upsert = (0, react_1.useCallback)(async (record, table) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.upsert(record, table);
    }, [db]);
    const find = (0, react_1.useCallback)(async (options) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.find(options);
    }, [db]);
    const search = (0, react_1.useCallback)(async (query, options) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.search(query, options);
    }, [db]);
    const getAll = (0, react_1.useCallback)(async (table, limit) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.getAll(table, limit);
    }, [db]);
    const getStats = (0, react_1.useCallback)(async (table) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.getStats(table);
    }, [db]);
    const subscribe = (0, react_1.useCallback)((table, fn) => {
        if (!db)
            throw new Error("Database not initialized");
        return db.subscribe(table, fn);
    }, [db]);
    const transaction = (0, react_1.useCallback)(async (work) => {
        if (!db)
            throw new Error("Database not initialized");
        return await db.transaction(work);
    }, [db]);
    const result = (0, react_1.useMemo)(() => ({
        db,
        isLoading,
        error,
        insert,
        update,
        delete: deleteRecord,
        upsert,
        find,
        search,
        getAll,
        getStats,
        subscribe,
        transaction
    }), [
        db,
        isLoading,
        error,
        insert,
        update,
        deleteRecord,
        upsert,
        find,
        search,
        getAll,
        getStats,
        subscribe,
        transaction
    ]);
    return result;
}
