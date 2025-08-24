"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncManager = exports.RESTfulSyncAdapter = exports.SupabaseSyncAdapter = exports.FirebaseSyncAdapter = void 0;
exports.createSyncAdapter = createSyncAdapter;
__exportStar(require("./base-adapter"), exports);
__exportStar(require("./types"), exports);
var firebase_adapter_1 = require("./adapters/firebase-adapter");
Object.defineProperty(exports, "FirebaseSyncAdapter", { enumerable: true, get: function () { return firebase_adapter_1.FirebaseSyncAdapter; } });
var supabase_adapter_1 = require("./adapters/supabase-adapter");
Object.defineProperty(exports, "SupabaseSyncAdapter", { enumerable: true, get: function () { return supabase_adapter_1.SupabaseSyncAdapter; } });
var rest_adapter_1 = require("./adapters/rest-adapter");
Object.defineProperty(exports, "RESTfulSyncAdapter", { enumerable: true, get: function () { return rest_adapter_1.RESTfulSyncAdapter; } });
class SyncManager {
    constructor(db) {
        this.adapters = new Map();
        this.db = db;
    }
    /**
     * Register a sync adapter
     */
    registerAdapter(name, adapter) {
        this.adapters.set(name, adapter);
    }
    /**
     * Get a sync adapter by name
     */
    getAdapter(name) {
        return this.adapters.get(name);
    }
    /**
     * Get all registered adapters
     */
    getAllAdapters() {
        return Array.from(this.adapters.values());
    }
    /**
     * Remove a sync adapter
     */
    removeAdapter(name) {
        const adapter = this.adapters.get(name);
        if (adapter) {
            adapter.dispose();
            this.adapters.delete(name);
        }
    }
    /**
     * Start all registered sync adapters
     */
    async startAll() {
        const results = await Promise.allSettled(Array.from(this.adapters.values()).map(adapter => adapter.start()));
        const errors = results.filter(result => result.status === 'rejected');
        if (errors.length > 0) {
            console.warn('Some sync adapters failed to start:', errors);
        }
    }
    /**
     * Stop all sync adapters
     */
    stopAll() {
        for (const adapter of this.adapters.values()) {
            adapter.stop();
        }
    }
    /**
     * Get status of all sync adapters
     */
    getStatus() {
        const status = {};
        for (const [name, adapter] of this.adapters) {
            status[name] = adapter.getStatus();
        }
        return status;
    }
    /**
     * Dispose all resources
     */
    dispose() {
        this.stopAll();
        for (const adapter of this.adapters.values()) {
            adapter.dispose();
        }
        this.adapters.clear();
    }
}
exports.SyncManager = SyncManager;
/**
 * Helper function to create and register a sync adapter
 */
function createSyncAdapter(db, type, options) {
    let adapter;
    switch (type) {
        case 'firebase':
            const { FirebaseSyncAdapter } = require('./adapters/firebase-adapter');
            adapter = new FirebaseSyncAdapter(db, options);
            break;
        case 'supabase':
            const { SupabaseSyncAdapter } = require('./adapters/supabase-adapter');
            adapter = new SupabaseSyncAdapter(db, options);
            break;
        case 'rest':
            const { RESTfulSyncAdapter } = require('./adapters/rest-adapter');
            adapter = new RESTfulSyncAdapter(db, options);
            break;
        default:
            throw new Error(`Unsupported sync adapter type: ${type}`);
    }
    return adapter;
}
