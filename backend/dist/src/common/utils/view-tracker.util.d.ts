declare class ViewTracker {
    private cache;
    private readonly TTL_MS;
    private readonly CLEANUP_INTERVAL_MS;
    private readonly MAX_CACHE_SIZE;
    private cleanupTimer;
    constructor();
    shouldIncrementView(postId: string, ipHash: string): boolean;
    private evictOldestRecords;
    private cleanup;
    destroy(): void;
    getCacheSize(): number;
}
export declare const viewTracker: ViewTracker;
export {};
