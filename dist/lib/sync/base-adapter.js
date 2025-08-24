"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSyncAdapter = void 0;
class BaseSyncAdapter {
    constructor(db, options = {}) {
        this.pendingChanges = new Map();
        this.listeners = new Set();
        this.db = db;
        this.options = {
            interval: 5000,
            realtime: false,
            conflictStrategy: 'local-wins',
            maxRetries: 3,
            backoffStrategy: 'exponential',
            ...options
        };
        this.status = {
            status: 'idle',
            pendingChanges: 0,
            tables: {}
        };
    }
    /**
     * Start synchronization
     */
    async start() {
        try {
            await this.initialize();
            if (this.options.realtime) {
                await this.setupRealtimeListeners();
            }
            if (this.options.interval && this.options.interval > 0) {
                this.syncInterval = setInterval(() => this.sync(), this.options.interval);
            }
            // Initial sync
            await this.sync();
            this.emit({ type: 'sync-start' });
        }
        catch (error) {
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('Sync start failed')
            });
            throw error;
        }
    }
    /**
     * Stop synchronization
     */
    stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = undefined;
        }
        this.teardownRealtimeListeners();
        this.status.status = 'idle';
    }
    /**
     * Perform a sync operation
     */
    async sync() {
        if (this.status.status === 'syncing')
            return;
        this.status.status = 'syncing';
        try {
            // Push local changes first
            const localChanges = this.collectLocalChanges();
            if (localChanges.inserts.length > 0 || localChanges.updates.length > 0 || localChanges.deletes.length > 0) {
                await this.pushChanges(localChanges);
                this.clearLocalChanges(localChanges);
            }
            // Pull remote changes
            const remoteChanges = await this.pullChanges();
            await this.applyRemoteChanges(remoteChanges);
            this.status.lastSync = new Date();
            this.status.status = 'idle';
            this.emit({ type: 'sync-complete' });
        }
        catch (error) {
            this.status.status = 'error';
            this.status.error = error instanceof Error ? error.message : 'Sync failed';
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('Sync failed')
            });
        }
    }
    /**
     * Collect local changes that need to be synced
     */
    collectLocalChanges() {
        const changes = {
            inserts: [],
            updates: [],
            deletes: [],
            timestamp: new Date()
        };
        // Merge all pending changes
        for (const [table, changeSet] of this.pendingChanges) {
            changes.inserts.push(...changeSet.inserts.map(record => ({ ...record, _table: table })));
            changes.updates.push(...changeSet.updates.map(record => ({ ...record, _table: table })));
            changes.deletes.push(...changeSet.deletes);
        }
        return changes;
    }
    /**
     * Clear applied local changes
     */
    clearLocalChanges(appliedChanges) {
        // Implementation depends on specific change tracking
        this.pendingChanges.clear();
        this.status.pendingChanges = 0;
    }
    /**
     * Apply remote changes to local database
     */
    async applyRemoteChanges(changes) {
        for (const insert of changes.inserts) {
            const { _table, ...record } = insert;
            if (_table) {
                // Check for potential conflicts with existing records
                try {
                    const existing = await this.db.find({
                        table: _table,
                        where: { id: record.id }
                    });
                    if (existing.length > 0) {
                        // Conflict detected - resolve it
                        const resolved = this.resolveConflict(existing[0], record);
                        await this.db.update(record.id, resolved, _table);
                    }
                    else {
                        // No conflict, insert normally
                        await this.db.upsert(record, _table);
                    }
                }
                catch (error) {
                    console.warn('Failed to handle insert conflict:', error);
                    await this.db.upsert(record, _table);
                }
            }
        }
        for (const update of changes.updates) {
            const { _table, id, ...updates } = update;
            if (_table && id) {
                try {
                    // Get current local version
                    const localRecord = await this.db.find({
                        table: _table,
                        where: { id }
                    });
                    if (localRecord.length > 0 && this.hasConflict(localRecord[0], update)) {
                        // Conflict detected - resolve it
                        const resolved = this.resolveConflict(localRecord[0], { ...updates, id });
                        await this.db.update(id, resolved, _table);
                    }
                    else {
                        // No conflict, update normally
                        await this.db.update(id, updates, _table);
                    }
                }
                catch (error) {
                    console.warn('Failed to handle update conflict:', error);
                    await this.db.update(id, updates, _table);
                }
            }
        }
        for (const del of changes.deletes) {
            if (typeof del === 'object' && '_table' in del && 'id' in del) {
                await this.db.delete(del.id, del._table);
            }
            else if (typeof del === 'number') {
                // Handle simple numeric IDs (fallback)
                console.warn('Simple numeric delete ID without table specified');
            }
        }
    }
    /**
     * Resolve conflicts between local and remote changes
     */
    resolveConflict(local, remote) {
        // Emit conflict event for monitoring
        this.emit({
            type: 'conflict',
            data: { local, remote }
        });
        switch (this.options.conflictStrategy) {
            case 'local-wins':
                return local;
            case 'remote-wins':
                return remote;
            case 'merge':
                return this.mergeRecords(local, remote);
            case 'custom':
                if (this.options.conflictResolver) {
                    return this.options.conflictResolver(local, remote);
                }
            // Fall through to local-wins if no custom resolver
            default:
                return local;
        }
    }
    /**
     * Smart merge strategy that handles common conflict scenarios
     */
    mergeRecords(local, remote) {
        const merged = { ...local, ...remote };
        // Handle timestamp conflicts - use the latest timestamp
        if (local._lastModified && remote._lastModified) {
            const localTime = new Date(local._lastModified).getTime();
            const remoteTime = new Date(remote._lastModified).getTime();
            merged._lastModified = localTime > remoteTime
                ? local._lastModified
                : remote._lastModified;
        }
        // Handle version conflicts - use higher version
        if (local._version !== undefined && remote._version !== undefined) {
            merged._version = Math.max(local._version, remote._version);
        }
        // Mark as merged
        merged._merged = true;
        merged._mergedAt = new Date().toISOString();
        return merged;
    }
    /**
     * Detect if two records have conflicting changes
     */
    hasConflict(local, remote) {
        if (!local || !remote)
            return false;
        // Simple timestamp-based conflict detection
        if (local._lastModified && remote._lastModified) {
            const localTime = new Date(local._lastModified).getTime();
            const remoteTime = new Date(remote._lastModified).getTime();
            // Consider it a conflict if both records were modified around the same time
            const timeDiff = Math.abs(localTime - remoteTime);
            return timeDiff < 5000; // 5 second window for conflicts
        }
        // Version-based conflict detection
        if (local._version !== undefined && remote._version !== undefined) {
            return local._version === remote._version;
        }
        // Default: no conflict detection
        return false;
    }
    /**
     * Track local changes for synchronization
     */
    trackChange(table, type, record) {
        if (!this.pendingChanges.has(table)) {
            this.pendingChanges.set(table, {
                inserts: [],
                updates: [],
                deletes: [],
                timestamp: new Date()
            });
        }
        const changes = this.pendingChanges.get(table);
        switch (type) {
            case 'insert':
                changes.inserts.push(record);
                break;
            case 'update':
                changes.updates.push(record);
                break;
            case 'delete':
                changes.deletes.push(record.id);
                break;
        }
        this.status.pendingChanges++;
        this.emit({
            type: 'change-detected',
            table,
            data: { type, record }
        });
    }
    /**
     * Get current sync status
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Add sync event listener
     */
    onSyncEvent(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    /**
     * Emit sync event
     */
    emit(event) {
        for (const listener of this.listeners) {
            try {
                listener(event);
            }
            catch (error) {
                console.warn('Sync event listener error:', error);
            }
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        this.stop();
        this.listeners.clear();
        this.pendingChanges.clear();
    }
}
exports.BaseSyncAdapter = BaseSyncAdapter;
