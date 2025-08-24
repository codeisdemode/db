export interface UseStatsOptions {
    table?: string;
    refreshInterval?: number;
    deps?: unknown[];
}
export interface TableStats {
    count: number;
    totalBytes: number;
}
export interface OverallStats {
    totalTables: number;
    tables: Record<string, TableStats>;
    overallBytes: number;
}
export interface UseStatsResult {
    stats: TableStats | OverallStats | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
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
export declare function useStats(options?: UseStatsOptions): UseStatsResult;
/**
 * Helper hook to get memory usage estimation
 */
export declare function useMemoryUsage(): {
    estimatedRAM: string;
    isLoading: boolean;
};
//# sourceMappingURL=use-stats.d.ts.map