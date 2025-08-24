"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStats = useStats;
exports.useMemoryUsage = useMemoryUsage;
const react_1 = require("react");
const columnist_1 = require("@/lib/columnist");
/**
 * React hook for reactive database statistics
 *
 * @example
 * ```tsx
 * // Overall stats
 * const { stats: overallStats } = useStats()
 *
 * // Table-specific stats
 * const { stats: messageStats } = useStats({ table: "messages" })
 *
 * // With custom refresh interval
 * const { stats, refetch } = useStats({
 *   table: "messages",
 *   refreshInterval: 10000
 * })
 * ```
 */
function useStats(options = {}) {
    const [stats, setStats] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const { table, refreshInterval = 5000, deps = [] } = options;
    // Execute stats query
    const executeQuery = (0, react_1.useCallback)(async () => {
        try {
            setError(null);
            const db = columnist_1.ColumnistDB.getDB();
            const result = await db.getStats(table);
            setStats(result);
        }
        catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch stats"));
            setStats(null);
        }
        finally {
            setIsLoading(false);
        }
    }, [table]);
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
    // Auto-refresh interval
    (0, react_1.useEffect)(() => {
        if (refreshInterval <= 0)
            return;
        const interval = setInterval(() => {
            executeQuery();
        }, refreshInterval);
        return () => clearInterval(interval);
    }, [executeQuery, refreshInterval]);
    // Subscribe to database changes for reactive updates
    (0, react_1.useEffect)(() => {
        try {
            const db = columnist_1.ColumnistDB.getDB();
            if (table) {
                // Subscribe to specific table changes
                const unsubscribe = db.subscribe(table, () => {
                    executeQuery();
                });
                return unsubscribe;
            }
            else {
                // Subscribe to all table changes for overall stats
                // This is a simplified approach - in a real implementation,
                // you might want to subscribe to all known tables
                return undefined;
            }
        }
        catch (err) {
            // Database might not be initialized yet, ignore
            return undefined;
        }
    }, [table, executeQuery]);
    return (0, react_1.useMemo)(() => ({
        stats,
        isLoading,
        error,
        refetch
    }), [stats, isLoading, error, refetch]);
}
/**
 * Helper hook to get memory usage estimation
 */
function useMemoryUsage() {
    const { stats, isLoading } = useStats();
    const estimatedRAM = (0, react_1.useMemo)(() => {
        if (!stats || isLoading)
            return "...";
        if ("overallBytes" in stats) {
            // Overall stats - estimate based on total bytes
            const bytes = stats.overallBytes;
            const ramEstimate = bytes * 0.1; // Very rough estimate: 10% of storage size
            return formatBytes(ramEstimate);
        }
        else {
            // Single table stats
            const bytes = stats.totalBytes;
            const ramEstimate = bytes * 0.1;
            return formatBytes(ramEstimate);
        }
    }, [stats, isLoading]);
    return { estimatedRAM, isLoading };
}
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
