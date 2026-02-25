"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewTracker = void 0;
class ViewTracker {
    cache = new Map();
    TTL_MS = 10 * 60 * 1000;
    CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
    MAX_CACHE_SIZE = 100000;
    cleanupTimer = null;
    constructor() {
        this.cleanupTimer = setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL_MS);
        if (this.cleanupTimer &&
            typeof this.cleanupTimer === 'object' &&
            'unref' in this.cleanupTimer) {
            this.cleanupTimer.unref();
        }
    }
    shouldIncrementView(postId, ipHash) {
        const key = `${postId}:${ipHash}`;
        const now = Date.now();
        const record = this.cache.get(key);
        if (record && now - record.timestamp < this.TTL_MS) {
            return false;
        }
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            this.evictOldestRecords();
        }
        this.cache.set(key, { timestamp: now });
        return true;
    }
    evictOldestRecords() {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const evictCount = Math.ceil(this.MAX_CACHE_SIZE * 0.1);
        for (let i = 0; i < evictCount && i < entries.length; i++) {
            this.cache.delete(entries[i][0]);
        }
    }
    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.cache.entries()) {
            if (now - record.timestamp >= this.TTL_MS) {
                this.cache.delete(key);
            }
        }
    }
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        this.cache.clear();
    }
    getCacheSize() {
        return this.cache.size;
    }
}
exports.viewTracker = new ViewTracker();
//# sourceMappingURL=view-tracker.util.js.map