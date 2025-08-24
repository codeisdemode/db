"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useLiveQuery = useLiveQuery;
exports.useSearch = useSearch;
const react_1 = require("react");
const columnist_1 = require("@/lib/columnist");
/**
 * React hook for reactive database queries with automatic subscriptions
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { data: messages, isLoading } = useLiveQuery({
 *   table: "messages",
 *   where: { user_id: currentUserId },
 *   orderBy: { field: "timestamp", direction: "desc" },
 *   limit: 50
 * })
 *
 * // With dependencies
 * const { data: filtered } = useLiveQuery({
 *   table: "messages",
 *   where: { user_id: selectedUser },
 *   deps: [selectedUser]
 * })
 * ```
 */
function useLiveQuery(options) {
    const [data, setData] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const { table, where, orderBy, limit, offset, deps = [], subscribe = true } = options;
    // Create stable query options object
    const queryOptions = (0, react_1.useMemo)(() => ({
        table,
        where,
        orderBy,
        limit,
        offset
    }), [table, where, orderBy, limit, offset]);
    // Execute query
    const executeQuery = (0, react_1.useCallback)(async () => {
        try {
            setError(null);
            const db = columnist_1.ColumnistDB.getDB();
            const results = await db.find(queryOptions);
            setData(results);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Query failed"));
            setData([]);
        }
        finally {
            setIsLoading(false);
        }
    }, [queryOptions]);
    // Refetch function for manual updates
    const refetch = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        await executeQuery();
    }, [executeQuery]);
    // Initial query and dependency updates
    (0, react_1.useEffect)(() => {
        setIsLoading(true);
        executeQuery();
    }, [executeQuery, ...deps]);
    // Subscription for reactive updates
    (0, react_1.useEffect)(() => {
        if (!subscribe)
            return;
        try {
            const db = columnist_1.ColumnistDB.getDB();
            const unsubscribe = db.subscribe(table, (event) => {
                // Re-run query when table changes
                // This is a simple approach - could be optimized to only update
                // when the change affects the current query results
                executeQuery();
            });
            return unsubscribe;
        }
        catch (err) {
            // Database might not be initialized yet, ignore
            return undefined;
        }
    }, [table, subscribe, executeQuery]);
    return (0, react_1.useMemo)(() => ({
        data,
        isLoading,
        error,
        refetch
    }), [data, isLoading, error, refetch]);
}
/**
 * React hook for reactive full-text search with automatic subscriptions
 *
 * @example
 * ```tsx
 * const { data: searchResults, isLoading } = useSearch({
 *   table: "messages",
 *   query: searchTerm,
 *   limit: 20,
 *   deps: [searchTerm]
 * })
 * ```
 */
function useSearch(options) {
    const [data, setData] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const { table, query, limit, timeRange, deps = [], subscribe = true, ...filters } = options;
    // Create stable search options object
    const searchOptions = (0, react_1.useMemo)(() => ({
        table,
        limit: limit,
        timeRange: timeRange,
        ...filters
    }), [table, limit, timeRange, filters]);
    // Execute search
    const executeSearch = (0, react_1.useCallback)(async () => {
        try {
            setError(null);
            // Skip search if query is empty
            if (!query.trim()) {
                setData([]);
                setIsLoading(false);
                return;
            }
            const db = columnist_1.ColumnistDB.getDB();
            const results = await db.search(query, searchOptions);
            setData(results);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Search failed"));
            setData([]);
        }
        finally {
            setIsLoading(false);
        }
    }, [query, searchOptions]);
    // Refetch function for manual updates
    const refetch = (0, react_1.useCallback)(async () => {
        setIsLoading(true);
        await executeSearch();
    }, [executeSearch]);
    // Initial search and dependency updates
    (0, react_1.useEffect)(() => {
        setIsLoading(true);
        executeSearch();
    }, [executeSearch, ...deps]);
    // Subscription for reactive updates
    (0, react_1.useEffect)(() => {
        if (!subscribe)
            return;
        try {
            const db = columnist_1.ColumnistDB.getDB();
            const unsubscribe = db.subscribe(table, (event) => {
                // Re-run search when table changes
                executeSearch();
            });
            return unsubscribe;
        }
        catch (err) {
            // Database might not be initialized yet, ignore
            return undefined;
        }
    }, [table, subscribe, executeSearch]);
    return (0, react_1.useMemo)(() => ({
        data,
        isLoading,
        error,
        refetch
    }), [data, isLoading, error, refetch]);
}
