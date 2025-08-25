"use strict";
"use client";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _ColumnistDB_instance;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Columnist = exports.ColumnistDB = exports.DeviceTableSchema = exports.TableSchemaBuilder = void 0;
exports.defineTable = defineTable;
// Columnist: Client-side persisted database on top of IndexedDB with
// simple schema, insert/query APIs, TF-IDF inverted index search,
// subscriptions, transactions, and lightweight stats.
//
// Important notes:
// - Prefers browser environment with IndexedDB, falls back to in-memory storage
// - Supports both client-side and server-side usage
// Node.js compatibility (will be handled by build process)
const zod_1 = require("zod");
const sync_1 = require("./sync");
// Zod schema mapping for column types
const ColumnTypeSchemas = {
    string: zod_1.z.string(),
    number: zod_1.z.number(),
    boolean: zod_1.z.boolean(),
    date: zod_1.z.date(),
    json: zod_1.z.unknown()
};
// Schema builder for fluent API
class TableSchemaBuilder {
    constructor() {
        this.def = { columns: {} };
    }
    column(name, type) {
        this.def.columns[name] = type;
        return this;
    }
    primaryKey(field) {
        this.def.primaryKey = field;
        return this;
    }
    searchable(...fields) {
        this.def.searchableFields = fields;
        return this;
    }
    indexes(...fields) {
        this.def.secondaryIndexes = fields;
        return this;
    }
    validate(schema) {
        this.def.validation = schema;
        return this;
    }
    vector(config) {
        this.def.vector = config;
        return this;
    }
    build() {
        return {
            columns: this.def.columns,
            primaryKey: this.def.primaryKey,
            searchableFields: this.def.searchableFields,
            secondaryIndexes: this.def.secondaryIndexes,
            validation: this.def.validation,
            vector: this.def.vector
        };
    }
}
exports.TableSchemaBuilder = TableSchemaBuilder;
// Helper function to create schema builder
function defineTable() {
    return new TableSchemaBuilder();
}
// Device table schema for cross-device synchronization
exports.DeviceTableSchema = {
    columns: {
        deviceId: "string",
        deviceName: "string",
        platform: "string",
        os: "string",
        browser: "string",
        screenResolution: "string",
        language: "string",
        timezone: "string",
        capabilities: "json",
        createdAt: "date",
        lastSeen: "date",
        syncProtocolVersion: "string"
    },
    primaryKey: "deviceId",
    searchableFields: ["deviceName", "platform", "os"],
    secondaryIndexes: ["createdAt", "lastSeen"]
};
const META_SCHEMA_STORE = "_meta_schema";
const META_STATS_STORE = "_meta_stats";
const DEFAULT_TABLE = "messages";
// Utility to wrap IDBRequest in a Promise
function requestToPromise(req) {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}
// Utility to await transaction completion
function awaitTransaction(tx) {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
    });
}
function toISO(value) {
    if (value instanceof Date)
        return value.toISOString();
    return value;
}
function fromISO(type, value) {
    if (type === "date" && typeof value === "string")
        return new Date(value);
    return value;
}
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]+/gu, " ")
        .split(/\s+/)
        .filter(Boolean);
}
function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++)
        s += a[i] * b[i];
    return s;
}
function norm(a) {
    let s = 0;
    for (let i = 0; i < a.length; i++)
        s += a[i] * a[i];
    return Math.sqrt(s);
}
function euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}
function encodeCursor(obj) {
    try {
        return btoa(JSON.stringify(obj));
    }
    catch {
        return JSON.stringify(obj);
    }
}
function decodeCursor(s) {
    try {
        return JSON.parse(atob(s));
    }
    catch {
        try {
            return JSON.parse(s);
        }
        catch {
            return null;
        }
    }
}
function isClientIndexedDBAvailable() {
    return typeof window !== "undefined" && typeof indexedDB !== "undefined";
}
function suggestNodeJSCompatibility() {
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        return 'For Node.js usage, install fake-indexeddb: npm install --save-dev fake-indexeddb';
    }
    return 'This appears to be a non-browser environment. Columnist requires IndexedDB.';
}
class InMemoryStorage {
    constructor() {
        this.stores = new Map();
    }
    createStore(name) {
        if (!this.stores.has(name)) {
            this.stores.set(name, {
                data: new Map(),
                indexes: new Map()
            });
        }
    }
    put(storeName, key, value) {
        const store = this.stores.get(storeName);
        if (!store)
            throw new Error(`Store ${storeName} not found`);
        store.data.set(key, value);
    }
    get(storeName, key) {
        const store = this.stores.get(storeName);
        return store?.data.get(key);
    }
    getAll(storeName) {
        const store = this.stores.get(storeName);
        return store ? Array.from(store.data.values()) : [];
    }
    delete(storeName, key) {
        const store = this.stores.get(storeName);
        store?.data.delete(key);
    }
    clear(storeName) {
        const store = this.stores.get(storeName);
        store?.data.clear();
    }
}
// Global in-memory storage instance for Node.js
let inMemoryStorage = null;
function getInMemoryStorage() {
    if (!inMemoryStorage) {
        inMemoryStorage = new InMemoryStorage();
    }
    return inMemoryStorage;
}
// Build an object store name for the inverted index of a table
function indexStoreName(table) {
    return `_ii_${table}`;
}
// Per-table vector store name
function vectorStoreName(table) {
    return `_vec_${table}`;
}
// IVF index store name
function ivfStoreName(table) {
    return `_ivf_${table}`;
}
// Build a compound key to persist schema/meta entries by key
function metaKeyFor(table) {
    return `schema:${table}`;
}
function statsKeyFor(table) {
    return `stats:${table}`;
}
class ColumnistDB {
    constructor(name, schema, version, migrations) {
        this.db = null;
        this.subscribers = new Map();
        this.vectorEmbedders = new Map();
        this.vectorCache = new Map();
        this.encryptionKey = null;
        this.authHooks = new Map();
        this.syncManager = null;
        this.name = name;
        this.schema = schema;
        this.version = version;
        this.migrations = migrations;
        this.syncManager = new sync_1.SyncManager(this);
    }
    static async init(name, opts) {
        const useInMemory = !isClientIndexedDBAvailable();
        if (useInMemory) {
            console.warn("IndexedDB not available. Falling back to in-memory storage. Data will not persist.");
        }
        const schema = opts?.schema ?? {
            [DEFAULT_TABLE]: {
                columns: { id: "number", user_id: "number", message: "string", timestamp: "date" },
                primaryKey: "id",
                searchableFields: ["message"],
                secondaryIndexes: ["user_id", "timestamp"],
            },
        };
        const version = opts?.version ?? 1;
        const instance = new _a(name, schema, version, opts?.migrations);
        await instance.load();
        // Initialize encryption if key provided
        if (opts?.encryptionKey) {
            await instance.setEncryptionKey(opts.encryptionKey);
        }
        __classPrivateFieldSet(_a, _a, instance, "f", _ColumnistDB_instance);
        return instance;
    }
    static getDB() {
        if (!__classPrivateFieldGet(_a, _a, "f", _ColumnistDB_instance)) {
            throw new Error("Columnist has not been initialized. Call ColumnistDB.init(...) first.");
        }
        return __classPrivateFieldGet(_a, _a, "f", _ColumnistDB_instance);
    }
    defineSchema(schema, version) {
        this.schema = schema;
        if (typeof version === "number") {
            this.version = version;
        }
    }
    getSchema() {
        return this.schema;
    }
    async load() {
        if (!isClientIndexedDBAvailable()) {
            throw new Error(`IndexedDB is not available. Columnist requires a browser environment.\n\n${suggestNodeJSCompatibility()}`);
        }
        const openReq = indexedDB.open(this.name, this.version);
        openReq.onupgradeneeded = (event) => {
            const db = openReq.result;
            const oldVersion = event.oldVersion || 0;
            // Ensure meta stores exist
            if (!db.objectStoreNames.contains(META_SCHEMA_STORE)) {
                db.createObjectStore(META_SCHEMA_STORE, { keyPath: "key" });
            }
            if (!db.objectStoreNames.contains(META_STATS_STORE)) {
                db.createObjectStore(META_STATS_STORE, { keyPath: "key" });
            }
            // Create/upgrade table stores and their indexes
            for (const [table, def] of Object.entries(this.schema)) {
                const keyPath = def.primaryKey || "id";
                const autoIncrement = keyPath === "id";
                if (!db.objectStoreNames.contains(table)) {
                    const store = db.createObjectStore(table, { keyPath, autoIncrement });
                    // Secondary indexes
                    for (const idx of def.secondaryIndexes || []) {
                        try {
                            store.createIndex(idx, idx, { unique: false });
                        }
                        catch {
                            // If invalid, skip index creation (e.g., field not present yet)
                        }
                    }
                }
                else {
                    // Upgrade path: add missing indexes if any
                    const store = openReq.transaction.objectStore(table);
                    for (const idx of def.secondaryIndexes || []) {
                        if (!Array.from(store.indexNames).includes(idx)) {
                            try {
                                store.createIndex(idx, idx, { unique: false });
                            }
                            catch {
                                // Skip if creation fails
                            }
                        }
                    }
                }
                // Create a per-table inverted index store
                const iiStore = indexStoreName(table);
                if (!db.objectStoreNames.contains(iiStore)) {
                    db.createObjectStore(iiStore, { keyPath: "token" });
                }
                // Create a per-table vector store if vector config present
                if (def.vector) {
                    const vs = vectorStoreName(table);
                    if (!db.objectStoreNames.contains(vs)) {
                        db.createObjectStore(vs, { keyPath: "id" });
                    }
                    // Create IVF index store for approximate nearest neighbor search
                    const ivf = ivfStoreName(table);
                    if (!db.objectStoreNames.contains(ivf)) {
                        db.createObjectStore(ivf, { keyPath: "centroidId" });
                    }
                }
            }
            // Run user-defined migrations for each version step
            if (this.migrations) {
                const tx = openReq.transaction;
                for (let v = oldVersion + 1; v <= this.version; v++) {
                    const mig = this.migrations[v];
                    if (mig) {
                        try {
                            mig(db, tx, oldVersion);
                        }
                        catch (e) {
                            console.error("Migration failed for version", v, e);
                            throw e;
                        }
                    }
                }
            }
        };
        this.db = await requestToPromise(openReq);
        // Write schema to meta (exclude validation functions which can't be cloned)
        const tx = this.db.transaction([META_SCHEMA_STORE], "readwrite");
        const metaStore = tx.objectStore(META_SCHEMA_STORE);
        for (const [table, def] of Object.entries(this.schema)) {
            const { validation, ...serializableDef } = def;
            void metaStore.put({ key: metaKeyFor(table), value: serializableDef });
        }
        await awaitTransaction(tx);
    }
    // Validation helpers
    validateRecord(record, def) {
        // Auto-generate schema from column definitions if no custom validation
        if (!def.validation) {
            const autoSchema = this.generateAutoSchema(def);
            const result = autoSchema.safeParse(record);
            if (!result.success) {
                throw new Error(`Validation failed: ${result.error.message}`);
            }
            return result.data;
        }
        // Use custom validation schema
        const result = def.validation.safeParse(record);
        if (!result.success) {
            throw new Error(`Validation failed: ${result.error.message}`);
        }
        return result.data;
    }
    generateAutoSchema(def) {
        const shape = {};
        for (const [column, type] of Object.entries(def.columns)) {
            let schema = ColumnTypeSchemas[type];
            // Make id optional for inserts (auto-generated)
            if (column === (def.primaryKey || "id")) {
                schema = schema.optional();
            }
            shape[column] = schema;
        }
        return zod_1.z.object(shape);
    }
    // Insert record into a table
    async update(id, updates, table) {
        this.ensureDb();
        const tableName = table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        // Check authentication
        if (!this.checkAuth('update', tableName, { id, ...updates })) {
            throw new Error('Update operation not authorized');
        }
        const stores = [tableName, indexStoreName(tableName), META_STATS_STORE];
        if (def.vector)
            stores.push(vectorStoreName(tableName));
        const tx = this.db.transaction(stores, "readwrite");
        const store = tx.objectStore(tableName);
        // Get the existing record
        const existing = await requestToPromise(store.get(id));
        if (!existing) {
            throw new Error(`Record with id ${id} not found in table ${tableName}`);
        }
        // Denormalize existing record for comparison
        const oldRecord = { ...existing };
        for (const [col, type] of Object.entries(def.columns)) {
            oldRecord[col] = fromISO(type, existing[col]);
        }
        // Validate updates (partial validation for updates)
        if (def.validation) {
            // For updates, make all fields optional
            const updateSchema = def.validation.partial();
            const result = updateSchema.safeParse(updates);
            if (!result.success) {
                throw new Error(`Validation failed: ${result.error.message}`);
            }
        }
        // Normalize updates for storage
        const normalizedUpdates = {};
        for (const [k, v] of Object.entries(updates)) {
            const colType = def.columns[k];
            normalizedUpdates[k] = colType === "date" ? toISO(v) : v;
        }
        // Merge updates into existing record
        const updated = { ...existing, ...normalizedUpdates };
        await requestToPromise(store.put(updated));
        // Update inverted index - remove old tokens, add new ones
        const searchable = (def.searchableFields && def.searchableFields.length > 0)
            ? def.searchableFields
            : Object.entries(def.columns)
                .filter(([, t]) => t === "string")
                .map(([name]) => name);
        const iiStore = tx.objectStore(indexStoreName(tableName));
        // Get old and new tokens for searchable fields
        const oldTokens = new Set();
        const newTokens = new Set();
        for (const field of searchable) {
            // Old tokens
            const oldRaw = oldRecord[field];
            if (typeof oldRaw === "string") {
                for (const tok of tokenize(oldRaw))
                    oldTokens.add(tok);
            }
            // New tokens (use updated value if provided, otherwise keep old)
            const newRaw = field in updates ? updates[field] : oldRecord[field];
            if (typeof newRaw === "string") {
                for (const tok of tokenize(newRaw))
                    newTokens.add(tok);
            }
        }
        // Remove id from tokens that are no longer present
        const removedTokens = new Set([...oldTokens].filter(tok => !newTokens.has(tok)));
        for (const token of removedTokens) {
            const entry = await requestToPromise(iiStore.get(token));
            if (entry) {
                entry.ids = entry.ids.filter(recordId => recordId !== id);
                if (entry.ids.length === 0) {
                    await requestToPromise(iiStore.delete(token));
                }
                else {
                    await requestToPromise(iiStore.put(entry));
                }
            }
        }
        // Add id to new tokens
        const addedTokens = new Set([...newTokens].filter(tok => !oldTokens.has(tok)));
        for (const token of addedTokens) {
            const entry = await requestToPromise(iiStore.get(token));
            if (entry) {
                if (!entry.ids.includes(id)) {
                    entry.ids.push(id);
                    await requestToPromise(iiStore.put(entry));
                }
            }
            else {
                await requestToPromise(iiStore.put({ token, ids: [id] }));
            }
        }
        // Update stats (byte difference)
        const statsStore = tx.objectStore(META_STATS_STORE);
        const key = statsKeyFor(tableName);
        const prev = await requestToPromise(statsStore.get(key));
        if (prev) {
            const oldBytes = JSON.stringify(existing).length;
            const newBytes = JSON.stringify(updated).length;
            const byteDiff = newBytes - oldBytes;
            const nextStats = {
                count: prev.value.count, // Count stays the same
                totalBytes: prev.value.totalBytes + byteDiff,
            };
            await requestToPromise(statsStore.put({ key, value: nextStats }));
        }
        await awaitTransaction(tx);
        // Denormalize updated record for event
        const updatedRecord = { ...updated };
        for (const [col, type] of Object.entries(def.columns)) {
            updatedRecord[col] = fromISO(type, updated[col]);
        }
        // Notify subscribers
        this.notify(tableName, {
            table: tableName,
            type: "update",
            record: { ...updatedRecord, id },
            oldRecord: { ...oldRecord, id }
        });
        // Track change for synchronization
        this.trackSyncChange(tableName, 'update', { ...updatedRecord, id });
    }
    async delete(id, table) {
        this.ensureDb();
        const tableName = table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        // Check authentication
        if (!this.checkAuth('delete', tableName, { id })) {
            throw new Error('Delete operation not authorized');
        }
        const stores = [tableName, indexStoreName(tableName), META_STATS_STORE];
        if (def.vector)
            stores.push(vectorStoreName(tableName));
        const tx = this.db.transaction(stores, "readwrite");
        const store = tx.objectStore(tableName);
        // Get the existing record before deletion
        const existing = await requestToPromise(store.get(id));
        if (!existing) {
            throw new Error(`Record with id ${id} not found in table ${tableName}`);
        }
        // Delete the record
        await requestToPromise(store.delete(id));
        // Remove from inverted index
        const searchable = (def.searchableFields && def.searchableFields.length > 0)
            ? def.searchableFields
            : Object.entries(def.columns)
                .filter(([, t]) => t === "string")
                .map(([name]) => name);
        const iiStore = tx.objectStore(indexStoreName(tableName));
        const tokens = new Set();
        for (const field of searchable) {
            const raw = existing[field];
            if (typeof raw === "string") {
                for (const tok of tokenize(raw))
                    tokens.add(tok);
            }
        }
        // Remove id from all tokens
        for (const token of tokens) {
            const entry = await requestToPromise(iiStore.get(token));
            if (entry) {
                entry.ids = entry.ids.filter(recordId => recordId !== id);
                if (entry.ids.length === 0) {
                    await requestToPromise(iiStore.delete(token));
                }
                else {
                    await requestToPromise(iiStore.put(entry));
                }
            }
        }
        // Remove any vector entry
        if (def.vector) {
            const vStore = tx.objectStore(vectorStoreName(tableName));
            try {
                await requestToPromise(vStore.delete(id));
            }
            catch { }
        }
        // Update stats
        const statsStore = tx.objectStore(META_STATS_STORE);
        const key = statsKeyFor(tableName);
        const prev = await requestToPromise(statsStore.get(key));
        if (prev) {
            const bytes = JSON.stringify(existing).length;
            const nextStats = {
                count: prev.value.count - 1,
                totalBytes: Math.max(0, prev.value.totalBytes - bytes),
            };
            await requestToPromise(statsStore.put({ key, value: nextStats }));
        }
        await awaitTransaction(tx);
        // Denormalize deleted record for event
        const deletedRecord = { ...existing };
        for (const [col, type] of Object.entries(def.columns)) {
            deletedRecord[col] = fromISO(type, existing[col]);
        }
        // Notify subscribers
        this.notify(tableName, {
            table: tableName,
            type: "delete",
            record: { ...deletedRecord, id }
        });
        // Track change for synchronization
        this.trackSyncChange(tableName, 'delete', { id });
    }
    async upsert(record, table) {
        this.ensureDb();
        const tableName = table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        const pkField = def.primaryKey || "id";
        const pkValue = record[pkField];
        if (pkValue === undefined || pkValue === null) {
            // No primary key provided, insert new record
            return await this.insert(record, tableName);
        }
        // Check if record exists
        const tx = this.db.transaction([tableName], "readonly");
        const store = tx.objectStore(tableName);
        const existing = await requestToPromise(store.get(pkValue));
        if (existing) {
            // Record exists, update it
            const { [pkField]: _, ...updates } = record; // Remove PK from updates
            await this.update(pkValue, updates, tableName);
            return { id: pkValue };
        }
        else {
            // Record doesn't exist, insert it
            return await this.insert(record, tableName);
        }
    }
    /**
     * Bulk insert multiple records with optimized performance
     */
    async bulkInsert(records, table) {
        this.ensureDb();
        const tableName = table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        const result = { success: 0, errors: [] };
        if (records.length === 0) {
            return result;
        }
        const stores = [tableName, indexStoreName(tableName), META_STATS_STORE];
        if (def.vector)
            stores.push(vectorStoreName(tableName));
        const tx = this.db.transaction(stores, "readwrite");
        const store = tx.objectStore(tableName);
        const iiStore = tx.objectStore(indexStoreName(tableName));
        const statsStore = tx.objectStore(META_STATS_STORE);
        const searchable = (def.searchableFields && def.searchableFields.length > 0)
            ? def.searchableFields
            : Object.entries(def.columns)
                .filter(([, t]) => t === "string")
                .map(([name]) => name);
        for (const record of records) {
            try {
                // Check authentication
                if (!this.checkAuth('insert', tableName, record)) {
                    throw new Error('Insert operation not authorized');
                }
                // Validate record
                const validatedRecord = this.validateRecord(record, def);
                // Encrypt sensitive fields
                const encryptedRecord = await this.encryptSensitiveFields(validatedRecord, def);
                // Normalize for storage
                const normalized = {};
                for (const [k, v] of Object.entries(encryptedRecord)) {
                    const colType = def.columns[k];
                    normalized[k] = colType === "date" ? toISO(v) : v;
                }
                const id = await requestToPromise(store.add(normalized));
                // Build inverted index
                const tokens = new Set();
                for (const field of searchable) {
                    const raw = record[field];
                    if (typeof raw === "string") {
                        for (const tok of tokenize(raw))
                            tokens.add(tok);
                    }
                }
                for (const token of tokens) {
                    const existing = await requestToPromise(iiStore.get(token));
                    if (existing) {
                        if (!existing.ids.includes(id))
                            existing.ids.push(id);
                        await requestToPromise(iiStore.put(existing));
                    }
                    else {
                        await requestToPromise(iiStore.put({ token, ids: [id] }));
                    }
                }
                // Update stats
                const key = statsKeyFor(tableName);
                const prev = await requestToPromise(statsStore.get(key));
                const bytes = JSON.stringify(normalized).length;
                const nextStats = {
                    count: (prev?.value.count ?? 0) + 1,
                    totalBytes: (prev?.value.totalBytes ?? 0) + bytes,
                };
                await requestToPromise(statsStore.put({ key, value: nextStats }));
                result.success++;
                // Notify subscribers
                this.notify(tableName, { table: tableName, type: "insert", record: { ...record, id } });
                this.trackSyncChange(tableName, 'insert', { ...record, id });
            }
            catch (error) {
                result.errors.push({ error: error, record });
            }
        }
        await awaitTransaction(tx);
        return result;
    }
    /**
     * Bulk update multiple records with optimized performance
     */
    async bulkUpdate(updates, table) {
        this.ensureDb();
        const tableName = table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        const result = { success: 0, errors: [] };
        if (updates.length === 0) {
            return result;
        }
        const stores = [tableName, indexStoreName(tableName), META_STATS_STORE];
        if (def.vector)
            stores.push(vectorStoreName(tableName));
        const tx = this.db.transaction(stores, "readwrite");
        const store = tx.objectStore(tableName);
        for (const { id, updates: updateData } of updates) {
            try {
                await this.update(id, updateData, tableName);
                result.success++;
            }
            catch (error) {
                result.errors.push({ error: error, record: { id, updates: updateData } });
            }
        }
        await awaitTransaction(tx);
        return result;
    }
    /**
     * Bulk delete multiple records with optimized performance
     */
    async bulkDelete(ids, table) {
        this.ensureDb();
        const tableName = table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        const result = { success: 0, errors: [] };
        if (ids.length === 0) {
            return result;
        }
        const stores = [tableName, indexStoreName(tableName), META_STATS_STORE];
        if (def.vector)
            stores.push(vectorStoreName(tableName));
        const tx = this.db.transaction(stores, "readwrite");
        const store = tx.objectStore(tableName);
        for (const id of ids) {
            try {
                await this.delete(id, tableName);
                result.success++;
            }
            catch (error) {
                result.errors.push({ error: error, record: { id } });
            }
        }
        await awaitTransaction(tx);
        return result;
    }
    async insert(record, table) {
        this.ensureDb();
        const tableName = table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        // Check authentication
        if (!this.checkAuth('insert', tableName, record)) {
            throw new Error('Insert operation not authorized');
        }
        // Validate record
        const validatedRecord = this.validateRecord(record, def);
        // Encrypt sensitive fields before storage
        const encryptedRecord = await this.encryptSensitiveFields(validatedRecord, def);
        // Normalize record for storage (convert Date to ISO)
        const normalized = {};
        for (const [k, v] of Object.entries(encryptedRecord)) {
            const colType = def.columns[k];
            normalized[k] = colType === "date" ? toISO(v) : v;
        }
        const stores = [tableName, indexStoreName(tableName), META_STATS_STORE];
        if (def.vector)
            stores.push(vectorStoreName(tableName));
        const tx = this.db.transaction(stores, "readwrite");
        const store = tx.objectStore(tableName);
        const id = await requestToPromise(store.add(normalized));
        // Build/update inverted index for searchable fields
        const searchable = (def.searchableFields && def.searchableFields.length > 0)
            ? def.searchableFields
            : Object.entries(def.columns)
                .filter(([, t]) => t === "string")
                .map(([name]) => name);
        const iiStore = tx.objectStore(indexStoreName(tableName));
        const tokens = new Set();
        for (const field of searchable) {
            const raw = record[field];
            if (typeof raw === "string") {
                for (const tok of tokenize(raw))
                    tokens.add(tok);
            }
        }
        for (const token of tokens) {
            const existing = await requestToPromise(iiStore.get(token));
            if (existing) {
                if (!existing.ids.includes(id))
                    existing.ids.push(id);
                await requestToPromise(iiStore.put(existing));
            }
            else {
                await requestToPromise(iiStore.put({ token, ids: [id] }));
            }
        }
        // Persist vector embedding if configured
        if (def.vector) {
            const embedder = this.vectorEmbedders.get(tableName);
            if (embedder) {
                const source = record[def.vector.field];
                if (typeof source === "string" && source.trim().length > 0) {
                    const vec = await embedder(source);
                    if (!(vec instanceof Float32Array) || vec.length !== def.vector.dims) {
                        throw new Error(`Embedding dimension mismatch for table ${tableName}. Expected ${def.vector.dims}, got ${vec.length}`);
                    }
                    const vStore = tx.objectStore(vectorStoreName(tableName));
                    await requestToPromise(vStore.put({ id, vector: Array.from(vec) }));
                }
            }
        }
        // Update stats
        const statsStore = tx.objectStore(META_STATS_STORE);
        const key = statsKeyFor(tableName);
        const prev = await requestToPromise(statsStore.get(key));
        const bytes = JSON.stringify(normalized).length;
        const nextStats = {
            count: (prev?.value.count ?? 0) + 1,
            totalBytes: (prev?.value.totalBytes ?? 0) + bytes,
        };
        await requestToPromise(statsStore.put({ key, value: nextStats }));
        await awaitTransaction(tx);
        // Notify subscribers
        this.notify(tableName, { table: tableName, type: "insert", record: { ...record, id } });
        // Track change for synchronization
        this.trackSyncChange(tableName, 'insert', { ...record, id });
        return { id };
    }
    async getAll(table, limit = 1000) {
        this.ensureDb();
        const def = this.ensureTable(table);
        // Check authentication
        if (!this.checkAuth('read', table)) {
            throw new Error('Read operation not authorized');
        }
        const out = [];
        const tx = this.db.transaction([table], "readonly");
        const store = tx.objectStore(table);
        const req = store.openCursor();
        return new Promise((resolve, reject) => {
            req.onsuccess = async () => {
                const cursor = req.result;
                if (cursor) {
                    const value = cursor.value;
                    value.id = cursor.primaryKey;
                    // Decrypt sensitive fields after retrieval
                    const decryptedValue = await this.decryptSensitiveFields(value, def);
                    out.push(decryptedValue);
                    if (out.length >= limit) {
                        resolve(out);
                        return;
                    }
                    cursor.continue();
                }
                else {
                    resolve(out);
                }
            };
            req.onerror = () => reject(req.error);
        });
    }
    async find(options = {}) {
        this.ensureDb();
        const tableName = options.table || DEFAULT_TABLE;
        const def = this.ensureTable(tableName);
        // Check authentication
        if (!this.checkAuth('read', tableName)) {
            throw new Error('Read operation not authorized');
        }
        const limit = options.limit || 1000;
        const offset = options.offset || 0;
        const tx = this.db.transaction([tableName], "readonly");
        const store = tx.objectStore(tableName);
        // Parse orderBy
        let orderField = null;
        let orderDirection = "asc";
        if (options.orderBy) {
            if (typeof options.orderBy === "string") {
                orderField = options.orderBy;
            }
            else {
                orderField = options.orderBy.field;
                orderDirection = options.orderBy.direction || "asc";
            }
        }
        // Parse where conditions
        const where = options.where || {};
        const whereFields = Object.keys(where);
        // Determine best query strategy
        let useIndex = false;
        let indexField = null;
        let indexRange = undefined;
        // Check if we can use an index for ordering or filtering
        if (orderField && this.hasIndex(def, orderField)) {
            useIndex = true;
            indexField = orderField;
        }
        else if (whereFields.length > 0) {
            // Find first where field that has an index
            for (const field of whereFields) {
                if (this.hasIndex(def, field)) {
                    useIndex = true;
                    indexField = field;
                    indexRange = this.buildKeyRange(where[field]);
                    break;
                }
            }
        }
        const results = [];
        let skipped = 0;
        if (useIndex && indexField) {
            // Use index-optimized query
            const index = indexField === (def.primaryKey || "id")
                ? store
                : store.index(indexField);
            const direction = orderDirection === "desc" ? "prev" : "next";
            const cursorReq = index.openCursor(indexRange, direction);
            await new Promise((resolve, reject) => {
                cursorReq.onsuccess = async () => {
                    const cursor = cursorReq.result;
                    if (!cursor || results.length >= limit) {
                        resolve();
                        return;
                    }
                    const record = cursor.value;
                    const id = typeof cursor.primaryKey === "number" ? cursor.primaryKey : record.id;
                    // Denormalize dates
                    for (const [col, type] of Object.entries(def.columns)) {
                        record[col] = fromISO(type, record[col]);
                    }
                    record.id = id;
                    // Decrypt sensitive fields
                    const decryptedRecord = await this.decryptSensitiveFields(record, def);
                    // Apply remaining where conditions
                    if (this.matchesWhere(decryptedRecord, where)) {
                        if (skipped >= offset) {
                            results.push(decryptedRecord);
                        }
                        else {
                            skipped++;
                        }
                    }
                    cursor.continue();
                };
                cursorReq.onerror = () => reject(cursorReq.error);
            });
        }
        else {
            // Fallback to full table scan
            const cursorReq = store.openCursor();
            await new Promise((resolve, reject) => {
                cursorReq.onsuccess = async () => {
                    const cursor = cursorReq.result;
                    if (!cursor || results.length >= limit) {
                        resolve();
                        return;
                    }
                    const record = cursor.value;
                    const id = cursor.primaryKey;
                    // Denormalize dates
                    for (const [col, type] of Object.entries(def.columns)) {
                        record[col] = fromISO(type, record[col]);
                    }
                    record.id = id;
                    // Decrypt sensitive fields
                    const decryptedRecord = await this.decryptSensitiveFields(record, def);
                    // Apply where conditions
                    if (this.matchesWhere(decryptedRecord, where)) {
                        if (skipped >= offset) {
                            results.push(decryptedRecord);
                        }
                        else {
                            skipped++;
                        }
                    }
                    cursor.continue();
                };
                cursorReq.onerror = () => reject(cursorReq.error);
            });
            // Sort if needed and no index was used
            if (orderField && !useIndex) {
                results.sort((a, b) => {
                    const aVal = a[orderField];
                    const bVal = b[orderField];
                    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                    return orderDirection === "desc" ? -comparison : comparison;
                });
            }
        }
        return results;
    }
    async search(query, options = {}) {
        this.ensureDb();
        const table = options.table || DEFAULT_TABLE;
        const def = this.ensureTable(table);
        const limit = typeof options.limit === "number" ? options.limit : 50;
        const tx = this.db.transaction([table, indexStoreName(table), META_STATS_STORE], "readonly");
        const iiStore = tx.objectStore(indexStoreName(table));
        const tableStore = tx.objectStore(table);
        const tokens = tokenize(query);
        // Read stats for IDF
        const statsStore = tx.objectStore(META_STATS_STORE);
        const statsKey = statsKeyFor(table);
        const statsEntry = await requestToPromise(statsStore.get(statsKey));
        const totalDocs = statsEntry?.value.count ?? 0;
        const idToScore = new Map();
        for (const tok of tokens) {
            const entry = await requestToPromise(iiStore.get(tok));
            const ids = entry?.ids || [];
            const df = ids.length || 1;
            const idf = Math.log((totalDocs + 1) / df);
            for (const id of ids) {
                idToScore.set(id, (idToScore.get(id) || 0) + idf);
            }
        }
        // Convert equality filters from options (exclude reserved keys)
        const reserved = new Set(["table", "limit", "timeRange"]);
        const equalityFilters = {};
        for (const [k, v] of Object.entries(options)) {
            if (!reserved.has(k))
                equalityFilters[k] = v;
        }
        const range = options.timeRange;
        let start = null;
        let end = null;
        if (range) {
            const s = range[0] instanceof Date ? range[0] : new Date(range[0]);
            const e = range[1] instanceof Date ? range[1] : new Date(range[1]);
            start = s.getTime();
            end = e.getTime();
        }
        // Gather candidate ids. If no tokens, consider full scan.
        const candidateIds = idToScore.size > 0 ? Array.from(idToScore.keys()) : await this.collectAllIds(table);
        const results = [];
        for (const id of candidateIds) {
            const rec = await requestToPromise(tableStore.get(id));
            if (!rec)
                continue;
            rec.id = id;
            // Convert dates back
            for (const [col, type] of Object.entries(def.columns)) {
                rec[col] = fromISO(type, rec[col]);
            }
            if (this.passesFilters(rec, equalityFilters) && this.passesTimeRange(rec, def, start, end)) {
                const score = idToScore.get(id) || 0;
                results.push({ ...rec, score, id });
            }
        }
        results.sort((a, b) => b.score - a.score);
        return results.slice(0, limit);
    }
    // Register an embedder function for a table. The embedder must return Float32Array of length dims.
    registerEmbedder(table, embedder) {
        this.ensureTable(table);
        this.vectorEmbedders.set(table, embedder);
    }
    // Security audit: Check for potential security issues
    async securityAudit() {
        const issues = [];
        const recommendations = [];
        // Check if running in browser environment (more secure)
        if (typeof window === 'undefined') {
            issues.push('Running in Node.js environment - data may be less secure');
            recommendations.push('Use browser environment for production applications');
        }
        // Check for large datasets that might need encryption
        const stats = await this.getStats();
        if (typeof stats !== 'object' || !('overallBytes' in stats)) {
            return { issues, recommendations };
        }
        const { overallBytes, tables } = stats;
        if (overallBytes > 10 * 1024 * 1024) { // 10MB threshold
            issues.push('Large dataset detected - consider encryption for sensitive data');
            recommendations.push('Implement encryption at rest for sensitive information');
        }
        // Check for potential sensitive field names
        const sensitivePatterns = [/password/i, /secret/i, /key/i, /token/i, /auth/i];
        for (const [tableName, tableDef] of Object.entries(this.schema)) {
            for (const fieldName of Object.keys(tableDef.columns)) {
                if (sensitivePatterns.some(pattern => pattern.test(fieldName))) {
                    issues.push(`Potential sensitive field name detected: ${tableName}.${fieldName}`);
                    recommendations.push(`Consider encrypting sensitive field: ${tableName}.${fieldName}`);
                }
            }
        }
        return { issues, recommendations };
    }
    // Encryption methods
    async setEncryptionKey(key) {
        if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
            throw new Error('Web Crypto API not available in this environment');
        }
        // Derive key from password using PBKDF2
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey('raw', encoder.encode(key), 'PBKDF2', false, ['deriveKey']);
        this.encryptionKey = await window.crypto.subtle.deriveKey({
            name: 'PBKDF2',
            salt: encoder.encode('columnist-encryption-salt'),
            iterations: 100000,
            hash: 'SHA-256'
        }, keyMaterial, {
            name: 'AES-GCM',
            length: 256
        }, false, ['encrypt', 'decrypt']);
    }
    async encryptData(data) {
        if (!this.encryptionKey)
            return data;
        const encoder = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt({
            name: 'AES-GCM',
            iv: iv
        }, this.encryptionKey, encoder.encode(data));
        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return btoa(String.fromCharCode(...combined));
    }
    async decryptData(encryptedData) {
        if (!this.encryptionKey)
            return encryptedData;
        try {
            const combined = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);
            const decrypted = await window.crypto.subtle.decrypt({
                name: 'AES-GCM',
                iv: iv
            }, this.encryptionKey, data);
            return new TextDecoder().decode(decrypted);
        }
        catch {
            return encryptedData; // Return original if decryption fails
        }
    }
    async encryptSensitiveFields(record, def) {
        if (!this.encryptionKey)
            return record;
        const sensitivePatterns = [/password/i, /secret/i, /key/i, /token/i, /auth/i];
        const result = { ...record };
        for (const [field, value] of Object.entries(record)) {
            if (typeof value === 'string' && sensitivePatterns.some(pattern => pattern.test(field))) {
                result[field] = await this.encryptData(value);
            }
        }
        return result;
    }
    async decryptSensitiveFields(record, def) {
        if (!this.encryptionKey)
            return record;
        const sensitivePatterns = [/password/i, /secret/i, /key/i, /token/i, /auth/i];
        const result = { ...record };
        for (const [field, value] of Object.entries(record)) {
            if (typeof value === 'string' && sensitivePatterns.some(pattern => pattern.test(field))) {
                result[field] = await this.decryptData(value);
            }
        }
        return result;
    }
    // Authentication hooks
    registerAuthHook(name, hook) {
        this.authHooks.set(name, hook);
    }
    removeAuthHook(name) {
        this.authHooks.delete(name);
    }
    checkAuth(operation, table, data) {
        if (this.authHooks.size === 0)
            return true;
        for (const hook of this.authHooks.values()) {
            if (!hook(operation, table, data)) {
                return false;
            }
        }
        return true;
    }
    // Build IVF index for approximate nearest neighbor search
    async buildIVFIndex(table, numCentroids = 16) {
        this.ensureDb();
        const def = this.ensureTable(table);
        if (!def.vector)
            throw new Error(`Table ${table} has no vector configuration`);
        const tx = this.db.transaction([vectorStoreName(table), ivfStoreName(table)], "readwrite");
        const vStore = tx.objectStore(vectorStoreName(table));
        const ivfStore = tx.objectStore(ivfStoreName(table));
        // Collect all vectors
        const allVectors = [];
        await new Promise((resolve, reject) => {
            const req = vStore.openCursor();
            req.onsuccess = () => {
                const cursor = req.result;
                if (!cursor) {
                    resolve();
                    return;
                }
                const { id, vector } = cursor.value;
                allVectors.push({ id, vector: new Float32Array(vector) });
                cursor.continue();
            };
            req.onerror = () => reject(req.error);
        });
        if (allVectors.length === 0)
            return;
        // Simple k-means clustering for centroids
        const dims = def.vector.dims;
        const centroids = [];
        // Initialize centroids with random vectors
        for (let i = 0; i < numCentroids; i++) {
            const randomIdx = Math.floor(Math.random() * allVectors.length);
            centroids.push(allVectors[randomIdx].vector);
        }
        // Simple k-means iteration
        for (let iter = 0; iter < 10; iter++) {
            const clusters = Array(numCentroids).fill(null).map(() => []);
            // Assign vectors to nearest centroid
            for (const { id, vector } of allVectors) {
                let minDist = Infinity;
                let bestCentroid = 0;
                for (let i = 0; i < centroids.length; i++) {
                    const dist = this.euclideanDistance(vector, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCentroid = i;
                    }
                }
                clusters[bestCentroid].push(id);
            }
            // Update centroids
            for (let i = 0; i < centroids.length; i++) {
                if (clusters[i].length > 0) {
                    const newCentroid = new Float32Array(dims);
                    for (const id of clusters[i]) {
                        const vec = allVectors.find(v => v.id === id)?.vector;
                        if (vec) {
                            for (let j = 0; j < dims; j++) {
                                newCentroid[j] += vec[j];
                            }
                        }
                    }
                    for (let j = 0; j < dims; j++) {
                        newCentroid[j] /= clusters[i].length;
                    }
                    centroids[i] = newCentroid;
                }
            }
        }
        // Store centroids and their associated vectors
        for (let centroidId = 0; centroidId < centroids.length; centroidId++) {
            const clusterIds = [];
            for (const { id, vector } of allVectors) {
                let minDist = Infinity;
                let bestCentroid = 0;
                for (let i = 0; i < centroids.length; i++) {
                    const dist = this.euclideanDistance(vector, centroids[i]);
                    if (dist < minDist) {
                        minDist = dist;
                        bestCentroid = i;
                    }
                }
                if (bestCentroid === centroidId) {
                    clusterIds.push(id);
                }
            }
            if (clusterIds.length > 0) {
                await requestToPromise(ivfStore.put({
                    centroidId,
                    centroid: Array.from(centroids[centroidId]),
                    vectorIds: clusterIds
                }));
            }
        }
        await awaitTransaction(tx);
    }
    // Cache vector for faster repeated queries
    euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            const diff = a[i] - b[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }
    cacheVector(key, vector) {
        this.vectorCache.set(key, vector);
        // Limit cache size to prevent memory issues
        if (this.vectorCache.size > 1000) {
            const firstKey = this.vectorCache.keys().next().value;
            if (firstKey)
                this.vectorCache.delete(firstKey);
        }
    }
    // Get cached vector or compute and cache
    async getCachedVector(table, text) {
        const cacheKey = `${table}:${text}`;
        const cached = this.vectorCache.get(cacheKey);
        if (cached)
            return cached;
        const embedder = this.vectorEmbedders.get(table);
        if (!embedder)
            throw new Error(`No embedder registered for table ${table}`);
        const vector = await embedder(text);
        this.cacheVector(cacheKey, vector);
        return vector;
    }
    // Convenience method for text-based vector search with caching
    async vectorSearchText(table, queryText, opts) {
        const vector = await this.getCachedVector(table, queryText);
        return this.vectorSearch(table, vector, opts);
    }
    // Vector search using cosine similarity (default) or dot/euclidean
    async vectorSearch(table, inputVector, opts) {
        this.ensureDb();
        const def = this.ensureTable(table);
        if (!def.vector)
            throw new Error(`Table ${table} has no vector configuration`);
        if (inputVector.length !== def.vector.dims)
            throw new Error(`Vector dimension mismatch. Expected ${def.vector.dims}`);
        const limit = opts?.limit ?? 50;
        const metric = opts?.metric ?? "cosine";
        const useIVF = opts?.useIVF ?? false;
        const tx = this.db.transaction([table, vectorStoreName(table), ivfStoreName(table)], "readonly");
        const vStore = tx.objectStore(vectorStoreName(table));
        const tStore = tx.objectStore(table);
        const ivfStore = tx.objectStore(ivfStoreName(table));
        const inputNorm = metric === "cosine" ? norm(inputVector) : 1;
        const results = [];
        if (useIVF) {
            // Use IVF index for approximate nearest neighbor search
            try {
                // Find nearest centroids
                const centroidDistances = [];
                await new Promise((resolve, reject) => {
                    const req = ivfStore.openCursor();
                    req.onsuccess = () => {
                        const cursor = req.result;
                        if (!cursor) {
                            resolve();
                            return;
                        }
                        const { centroidId, centroid } = cursor.value;
                        const centroidVec = new Float32Array(centroid);
                        const distance = this.euclideanDistance(inputVector, centroidVec);
                        centroidDistances.push({ centroidId, distance });
                        cursor.continue();
                    };
                    req.onerror = () => reject(req.error);
                });
                // Sort centroids by distance and take top 3
                centroidDistances.sort((a, b) => a.distance - b.distance);
                const nearestCentroids = centroidDistances.slice(0, 3);
                // Search only in nearest clusters
                for (const { centroidId } of nearestCentroids) {
                    const ivfEntry = await requestToPromise(ivfStore.get(centroidId));
                    if (ivfEntry && ivfEntry.vectorIds) {
                        for (const id of ivfEntry.vectorIds) {
                            const vecEntry = await requestToPromise(vStore.get(id));
                            if (vecEntry) {
                                const v = new Float32Array(vecEntry.vector);
                                let score = 0;
                                if (metric === "cosine")
                                    score = dot(inputVector, v) / (inputNorm * norm(v) || 1);
                                else if (metric === "dot")
                                    score = dot(inputVector, v);
                                else if (metric === "euclidean")
                                    score = -euclideanDistance(inputVector, v);
                                results.push({ id, score });
                                // Early termination if we have enough candidates
                                if (results.length >= limit * 2) {
                                    break;
                                }
                            }
                        }
                    }
                    if (results.length >= limit * 2) {
                        break;
                    }
                }
            }
            catch {
                // Fall back to full scan if IVF index is not available
                console.warn("IVF index not available, falling back to full scan");
            }
        }
        // Fallback to full scan if IVF is disabled or failed
        if (results.length === 0) {
            await new Promise((resolve, reject) => {
                const req = vStore.openCursor();
                req.onsuccess = async () => {
                    const cursor = req.result;
                    if (!cursor) {
                        resolve();
                        return;
                    }
                    const { id, vector } = cursor.value;
                    const v = new Float32Array(vector);
                    let score = 0;
                    if (metric === "cosine")
                        score = dot(inputVector, v) / (inputNorm * norm(v) || 1);
                    else if (metric === "dot")
                        score = dot(inputVector, v);
                    else if (metric === "euclidean")
                        score = -euclideanDistance(inputVector, v);
                    results.push({ id, score });
                    // Early termination for large datasets - stop after collecting 2x limit
                    if (results.length >= limit * 3) {
                        console.log("Early termination at", results.length, "vectors");
                        resolve();
                        return;
                    }
                    cursor.continue();
                };
                req.onerror = () => {
                    console.error("Vector cursor error:", req.error);
                    reject(req.error);
                };
            });
        }
        // Fetch records, apply optional where, sort and limit
        const out = [];
        for (const { id, score } of results) {
            const rec = await requestToPromise(tStore.get(id));
            if (!rec)
                continue;
            // Optional where filters
            if (opts?.where && !this.matchesWhere(rec, opts.where))
                continue;
            out.push({ ...rec, id, score });
        }
        out.sort((a, b) => b.score - a.score);
        return out.slice(0, limit);
    }
    // Export data for selected tables (or all) as a JSON object
    async export(options) {
        this.ensureDb();
        const tables = options?.tables ?? Object.keys(this.schema);
        const result = {};
        for (const table of tables) {
            const all = await this.getAll(table, Number.MAX_SAFE_INTEGER);
            result[table] = all;
        }
        return result;
    }
    // Import data with merge or replace mode
    async import(data, mode = "merge") {
        this.ensureDb();
        const allStores = new Set([META_STATS_STORE]);
        for (const table of Object.keys(data)) {
            this.ensureTable(table);
            allStores.add(table);
            allStores.add(indexStoreName(table));
            if (this.schema[table].vector)
                allStores.add(vectorStoreName(table));
        }
        const tx = this.db.transaction(Array.from(allStores), "readwrite");
        for (const [table, rows] of Object.entries(data)) {
            const def = this.ensureTable(table);
            const store = tx.objectStore(table);
            const ii = tx.objectStore(indexStoreName(table));
            const vStore = def.vector ? tx.objectStore(vectorStoreName(table)) : null;
            if (mode === "replace") {
                await requestToPromise(store.clear());
                await requestToPromise(ii.clear());
                if (vStore)
                    await requestToPromise(vStore.clear());
            }
            for (const row of rows) {
                const { id, ...rest } = row;
                const insertRes = await requestToPromise(store.put({ ...rest, id }));
                const assignedId = insertRes ?? id;
                // Rebuild text index
                const searchable = (def.searchableFields && def.searchableFields.length > 0)
                    ? def.searchableFields
                    : Object.entries(def.columns).filter(([, t]) => t === "string").map(([name]) => name);
                const tokenSet = new Set();
                for (const f of searchable) {
                    const raw = row[f];
                    if (typeof raw === "string")
                        for (const t of tokenize(raw))
                            tokenSet.add(t);
                }
                for (const token of tokenSet) {
                    const existing = await requestToPromise(ii.get(token));
                    if (existing) {
                        if (!existing.ids.includes(assignedId))
                            existing.ids.push(assignedId);
                        await requestToPromise(ii.put(existing));
                    }
                    else {
                        await requestToPromise(ii.put({ token, ids: [assignedId] }));
                    }
                }
                // Restore vector if present in row
                if (vStore && row.vector && Array.isArray(row.vector)) {
                    await requestToPromise(vStore.put({ id: assignedId, vector: row.vector }));
                }
            }
        }
        await awaitTransaction(tx);
    }
    // Keyset pagination returning a cursor
    async findPage(options) {
        const limit = options.limit || 50;
        let results = await this.find(options);
        if (options.cursor) {
            const cursor = decodeCursor(options.cursor);
            if (cursor) {
                results = results.filter(r => r.id > cursor.lastId);
            }
        }
        const page = results.slice(0, limit);
        const last = page[page.length - 1];
        const nextCursor = last ? encodeCursor({ lastId: last.id }) : null;
        return { data: page, nextCursor };
    }
    async transaction(work) {
        this.ensureDb();
        // We open a readwrite transaction across all current stores for simplicity
        const storeNames = this.allStoreNamesForTx();
        const tx = this.db.transaction(storeNames, "readwrite");
        const insert = async (record, table) => {
            // Re-implement insert logic but using provided tx
            const tableName = table || DEFAULT_TABLE;
            const def = this.ensureTable(tableName);
            const normalized = {};
            for (const [k, v] of Object.entries(record)) {
                const colType = def.columns[k];
                normalized[k] = colType === "date" ? toISO(v) : v;
            }
            const store = tx.objectStore(tableName);
            const id = await requestToPromise(store.add(normalized));
            // Update inverted index
            const searchable = (def.searchableFields && def.searchableFields.length > 0)
                ? def.searchableFields
                : Object.entries(def.columns).filter(([, t]) => t === "string").map(([name]) => name);
            const iiStore = tx.objectStore(indexStoreName(tableName));
            const tokens = new Set();
            for (const field of searchable) {
                const raw = record[field];
                if (typeof raw === "string") {
                    for (const tok of tokenize(raw))
                        tokens.add(tok);
                }
            }
            for (const token of tokens) {
                const existing = await requestToPromise(iiStore.get(token));
                if (existing) {
                    if (!existing.ids.includes(id))
                        existing.ids.push(id);
                    await requestToPromise(iiStore.put(existing));
                }
                else {
                    await requestToPromise(iiStore.put({ token, ids: [id] }));
                }
            }
            // Update stats
            const statsStore = tx.objectStore(META_STATS_STORE);
            const key = statsKeyFor(tableName);
            const prev = await requestToPromise(statsStore.get(key));
            const bytes = JSON.stringify(normalized).length;
            const nextStats = {
                count: (prev?.value.count ?? 0) + 1,
                totalBytes: (prev?.value.totalBytes ?? 0) + bytes,
            };
            await requestToPromise(statsStore.put({ key, value: nextStats }));
            // Notify subscribers after outer transaction completes
            queueMicrotask(() => this.notify(tableName, { table: tableName, type: "insert", record: { ...record, id } }));
            return { id };
        };
        await work({ insert });
        await awaitTransaction(tx);
    }
    async getStats(table) {
        this.ensureDb();
        const tx = this.db.transaction([META_STATS_STORE], "readonly");
        const statsStore = tx.objectStore(META_STATS_STORE);
        if (table) {
            const entry = await requestToPromise(statsStore.get(statsKeyFor(table)));
            const value = entry?.value ?? { count: 0, totalBytes: 0 };
            return value;
        }
        const tables = {};
        const req = statsStore.openCursor();
        let overall = 0;
        await new Promise((resolve, reject) => {
            req.onsuccess = () => {
                const cursor = req.result;
                if (cursor) {
                    const key = cursor.value.key;
                    const t = key.replace(/^stats:/, "");
                    const value = cursor.value.value;
                    tables[t] = value;
                    overall += value.totalBytes;
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            req.onerror = () => reject(req.error);
        });
        return { totalTables: Object.keys(tables).length, tables, overallBytes: overall };
    }
    subscribe(table, fn) {
        if (!this.subscribers.has(table))
            this.subscribers.set(table, new Set());
        this.subscribers.get(table).add(fn);
        return () => {
            this.subscribers.get(table)?.delete(fn);
        };
    }
    // Get strongly typed interface for this database
    typed() {
        return {
            insert: (record, table) => this.insert(record, table),
            update: (id, updates, table) => this.update(id, updates, table),
            find: (options) => this.find({ ...options, table: options.table }),
            search: (query, options) => this.search(query, { ...options, table: options.table }),
            getAll: (table, limit) => this.getAll(table, limit),
            bulkInsert: (records, table) => this.bulkInsert(records, table),
            bulkUpdate: (updates, table) => this.bulkUpdate(updates, table),
            bulkDelete: (ids, table) => this.bulkDelete(ids, table)
        };
    }
    // Sync methods
    getSyncManager() {
        if (!this.syncManager) {
            this.syncManager = new sync_1.SyncManager(this);
        }
        return this.syncManager;
    }
    // Device management methods
    getDeviceManager() {
        const { getDeviceManager } = require('./sync/device-utils');
        return getDeviceManager(this);
    }
    async registerSyncAdapter(name, type, options) {
        const { createSyncAdapter } = await Promise.resolve().then(() => __importStar(require('./sync')));
        const adapter = createSyncAdapter(this, type, { ...options, name });
        this.getSyncManager().registerAdapter(name, adapter);
    }
    async startSync(name) {
        if (name) {
            const adapter = this.getSyncManager().getAdapter(name);
            if (adapter) {
                await adapter.start();
            }
        }
        else {
            await this.getSyncManager().startAll();
        }
    }
    stopSync(name) {
        if (name) {
            const adapter = this.getSyncManager().getAdapter(name);
            if (adapter) {
                adapter.stop();
            }
        }
        else {
            this.getSyncManager().stopAll();
        }
    }
    getSyncStatus(name) {
        if (name) {
            const adapter = this.getSyncManager().getAdapter(name);
            return adapter ? adapter.getStatus() : null;
        }
        return this.getSyncManager().getStatus();
    }
    /**
     * Track database changes for synchronization
     */
    trackSyncChange(table, type, record) {
        if (!this.syncManager)
            return;
        // Notify all registered adapters of the change
        for (const adapter of this.getSyncManager().getAllAdapters()) {
            adapter.trackChange(table, type, record);
        }
    }
    // Device management public methods
    async getCurrentDevice() {
        return this.getDeviceManager().getCurrentDevice();
    }
    async getAllDevices() {
        return this.getDeviceManager().getAllDevices();
    }
    async getOnlineDevices() {
        return this.getDeviceManager().getOnlineDevices();
    }
    async startDevicePresenceTracking(heartbeatInterval = 30000) {
        return this.getDeviceManager().startPresenceTracking(heartbeatInterval);
    }
    // Internal helpers
    notify(table, event) {
        const subs = this.subscribers.get(table);
        if (!subs)
            return;
        for (const fn of subs) {
            try {
                fn(event);
            }
            catch {
                // Ignore subscriber errors
            }
        }
    }
    ensureDb() {
        if (!this.db)
            throw new Error("Database not loaded. Call load() first.");
    }
    ensureTable(table) {
        const def = this.schema[table];
        if (!def)
            throw new Error(`Table not found in schema: ${table}`);
        return def;
    }
    async collectAllIds(table) {
        this.ensureDb();
        const tx = this.db.transaction([table], "readonly");
        const store = tx.objectStore(table);
        const req = store.openKeyCursor();
        const out = [];
        await new Promise((resolve, reject) => {
            req.onsuccess = () => {
                const cursor = req.result;
                if (cursor) {
                    out.push(cursor.primaryKey);
                    cursor.continue();
                }
                else {
                    resolve();
                }
            };
            req.onerror = () => reject(req.error);
        });
        return out;
    }
    passesFilters(record, filters) {
        for (const [k, v] of Object.entries(filters)) {
            if (record[k] !== v)
                return false;
        }
        return true;
    }
    passesTimeRange(record, def, start, end) {
        if (start === null && end === null)
            return true;
        // Attempt to use a conventional timestamp field if present
        const tsField = def.columns["timestamp"] ? "timestamp" : null;
        if (!tsField)
            return true;
        const value = record[tsField];
        if (!(value instanceof Date))
            return true;
        const t = value.getTime();
        if (start !== null && t < start)
            return false;
        if (end !== null && t > end)
            return false;
        return true;
    }
    allStoreNamesForTx() {
        // Include all table stores + meta and all inverted indexes
        const names = new Set([META_SCHEMA_STORE, META_STATS_STORE]);
        for (const table of Object.keys(this.schema)) {
            names.add(table);
            names.add(indexStoreName(table));
        }
        return Array.from(names);
    }
    hasIndex(def, field) {
        // Primary key is always indexed
        if (field === (def.primaryKey || "id"))
            return true;
        // Check secondary indexes
        return (def.secondaryIndexes || []).includes(field);
    }
    buildKeyRange(condition) {
        if (condition === null || condition === undefined)
            return undefined;
        if (typeof condition === "object" && condition !== null && !Array.isArray(condition) && !(condition instanceof Date)) {
            const cond = condition;
            // Range queries
            if ("$gt" in cond || "$gte" in cond || "$lt" in cond || "$lte" in cond) {
                const lower = cond.$gte !== undefined ? cond.$gte : cond.$gt;
                const upper = cond.$lte !== undefined ? cond.$lte : cond.$lt;
                const lowerOpen = cond.$gte === undefined && cond.$gt !== undefined;
                const upperOpen = cond.$lte === undefined && cond.$lt !== undefined;
                if (lower !== undefined && upper !== undefined) {
                    return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);
                }
                else if (lower !== undefined) {
                    return lowerOpen ? IDBKeyRange.lowerBound(lower, true) : IDBKeyRange.lowerBound(lower);
                }
                else if (upper !== undefined) {
                    return upperOpen ? IDBKeyRange.upperBound(upper, true) : IDBKeyRange.upperBound(upper);
                }
            }
            // $in queries - use only() for single values, no direct support for multiple
            if ("$in" in cond && Array.isArray(cond.$in) && cond.$in.length === 1) {
                return IDBKeyRange.only(cond.$in[0]);
            }
        }
        else {
            // Equality condition
            return IDBKeyRange.only(condition);
        }
        return undefined;
    }
    matchesWhere(record, where) {
        for (const [field, condition] of Object.entries(where)) {
            const value = record[field];
            if (!this.matchesCondition(value, condition)) {
                return false;
            }
        }
        return true;
    }
    matchesCondition(value, condition) {
        if (condition === null || condition === undefined) {
            return value === condition;
        }
        if (typeof condition === "object" && condition !== null && !Array.isArray(condition) && !(condition instanceof Date)) {
            const cond = condition;
            // Range conditions
            if ("$gt" in cond && !(value !== null && value !== undefined && value > cond.$gt))
                return false;
            if ("$gte" in cond && !(value !== null && value !== undefined && value >= cond.$gte))
                return false;
            if ("$lt" in cond && !(value !== null && value !== undefined && value < cond.$lt))
                return false;
            if ("$lte" in cond && !(value !== null && value !== undefined && value <= cond.$lte))
                return false;
            // $in condition
            if ("$in" in cond && Array.isArray(cond.$in)) {
                return cond.$in.includes(value);
            }
            return true;
        }
        else {
            // Equality condition
            return value === condition;
        }
    }
}
exports.ColumnistDB = ColumnistDB;
_a = ColumnistDB;
_ColumnistDB_instance = { value: null };
exports.Columnist = {
    init: ColumnistDB.init.bind(ColumnistDB),
    getDB: ColumnistDB.getDB.bind(ColumnistDB),
};
exports.default = exports.Columnist;
