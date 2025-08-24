import { type FindOptions, type SearchOptions } from "@/lib/columnist";
export interface UseLiveQueryOptions extends FindOptions {
    table: string;
    deps?: unknown[];
    subscribe?: boolean;
}
export interface UseLiveQueryResult<T = any> {
    data: (T & {
        id: number;
    })[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}
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
export declare function useLiveQuery<T = any>(options: UseLiveQueryOptions): UseLiveQueryResult<T>;
export interface UseSearchOptions extends Omit<SearchOptions, "table"> {
    table: string;
    query: string;
    deps?: unknown[];
    subscribe?: boolean;
}
export interface UseSearchResult<T = any> {
    data: (T & {
        id: number;
        score: number;
    })[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
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
export declare function useSearch<T = any>(options: UseSearchOptions): UseSearchResult<T>;
//# sourceMappingURL=use-live-query.d.ts.map