var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { BaseSyncAdapter } from 'columnist-db-core';
export class ConvexSyncAdapter extends BaseSyncAdapter {
    constructor(options) {
        super(options.db, options);
        this.convexClient = options.convexClient;
        this.mutationName = options.mutationName || 'syncColumnistData';
        this.queryName = options.queryName || 'getColumnistData';
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize convex connection
        });
    }
    pushChanges(changes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // For convex, we need to use a proper mutation reference
                // This is a simplified implementation - in real usage, you'd import the actual mutation
                if (typeof this.convexClient.mutation === 'function') {
                    yield this.convexClient.mutation(this.mutationName, { data: changes });
                }
            }
            catch (error) {
                console.error('Convex sync error:', error);
                throw error;
            }
        });
    }
    pullChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // For convex, we need to use a proper query reference
                // This is a simplified implementation - in real usage, you'd import the actual query
                if (typeof this.convexClient.query === 'function') {
                    const result = yield this.convexClient.query(this.queryName, {});
                    return result || { inserts: [], updates: [], deletes: [], timestamp: new Date() };
                }
                return { inserts: [], updates: [], deletes: [], timestamp: new Date() };
            }
            catch (error) {
                console.error('Convex query error:', error);
                return { inserts: [], updates: [], deletes: [], timestamp: new Date() };
            }
        });
    }
    setupRealtimeListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            // Subscribe to convex changes
            if (typeof this.convexClient.onUpdate === 'function') {
                this.convexClient.onUpdate(this.queryName, {}, (data) => {
                    this.handleIncomingData(data);
                });
            }
        });
    }
    teardownRealtimeListeners() {
        // Clean up convex subscriptions
    }
    handleIncomingData(data) {
        this.emit({ type: 'change-detected', data });
    }
    getStatus() {
        const baseStatus = super.getStatus();
        // For convex, we'll assume connected if no errors occur
        // Actual connection state checking would require more complex logic
        return Object.assign(Object.assign({}, baseStatus), { convexConnected: baseStatus.status !== 'error', lastSync: baseStatus.lastSync });
    }
}
//# sourceMappingURL=convex-adapter.js.map