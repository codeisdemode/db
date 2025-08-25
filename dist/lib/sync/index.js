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
exports.SyncManager = void 0;
exports.createSyncAdapter = createSyncAdapter;
__exportStar(require("./base-adapter"), exports);
__exportStar(require("./types"), exports);
const device_utils_1 = require("./device-utils");
class SyncManager {
    constructor(db) {
        this.adapters = new Map();
        this.db = db;
        this.deviceManager = (0, device_utils_1.getDeviceManager)(db);
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
     * Get device manager instance
     */
    getDeviceManager() {
        return this.deviceManager;
    }
    /**
     * Get online devices across all sync adapters
     */
    async getOnlineDevices() {
        return this.deviceManager.getOnlineDevices();
    }
    /**
     * Get device status
     */
    async getDeviceStatus(deviceId) {
        return this.deviceManager.getDeviceStatus(deviceId);
    }
    /**
     * Start device presence tracking
     */
    async startDevicePresenceTracking(heartbeatInterval = 30000) {
        return this.deviceManager.startPresenceTracking(heartbeatInterval);
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
            // Dynamic import to avoid circular dependencies
            const firebaseModule = require('./adapters/firebase-adapter');
            adapter = new firebaseModule.FirebaseSyncAdapter(db, options);
            break;
        case 'supabase':
            const supabaseModule = require('./adapters/supabase-adapter');
            adapter = new supabaseModule.SupabaseSyncAdapter(db, options);
            break;
        case 'rest':
            const restModule = require('./adapters/rest-adapter');
            adapter = new restModule.RESTfulSyncAdapter(db, options);
            break;
        default:
            throw new Error(`Unsupported sync adapter type: ${type}`);
    }
    return adapter;
}
