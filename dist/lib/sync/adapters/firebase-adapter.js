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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseSyncAdapter = void 0;
const base_adapter_1 = require("../base-adapter");
class FirebaseSyncAdapter extends base_adapter_1.BaseSyncAdapter {
    constructor(db, options) {
        super(db, options);
        this.realtimeListeners = new Map();
        this.config = options;
    }
    async initialize() {
        try {
            // Dynamically import Firebase
            const { initializeApp } = await Promise.resolve().then(() => __importStar(require('firebase/app')));
            const { getFirestore, collection, doc, setDoc, getDocs, onSnapshot } = await Promise.resolve().then(() => __importStar(require('firebase/firestore')));
            const { getAuth, signInWithEmailAndPassword, signInWithCustomToken } = await Promise.resolve().then(() => __importStar(require('firebase/auth')));
            // Initialize Firebase app
            const app = initializeApp({
                apiKey: this.config.apiKey,
                authDomain: this.config.authDomain,
                projectId: this.config.projectId,
                databaseURL: this.config.databaseURL,
                storageBucket: this.config.storageBucket,
                messagingSenderId: this.config.messagingSenderId,
                appId: this.config.appId
            });
            this.firestore = getFirestore(app);
            this.auth = getAuth(app);
            // Authenticate if credentials provided
            if (this.config.auth) {
                if ('email' in this.config.auth) {
                    await signInWithEmailAndPassword(this.auth, this.config.auth.email, this.config.auth.password);
                }
                else if ('token' in this.config.auth) {
                    await signInWithCustomToken(this.auth, this.config.auth.token);
                }
            }
            this.emit({ type: 'sync-start' });
        }
        catch (error) {
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('Firebase initialization failed')
            });
            throw error;
        }
    }
    async pushChanges(changes) {
        if (!this.firestore)
            throw new Error('Firebase not initialized');
        const { setDoc, doc } = await Promise.resolve().then(() => __importStar(require('firebase/firestore')));
        const collectionPrefix = this.config.collectionPrefix || 'columnist_';
        try {
            // Push inserts
            for (const insert of changes.inserts) {
                const { _table, id, ...data } = insert;
                if (_table && id) {
                    const collectionName = `${collectionPrefix}${_table}`;
                    await setDoc(doc(this.firestore, collectionName, id.toString()), {
                        ...data,
                        _lastModified: new Date().toISOString(),
                        _source: 'local'
                    });
                }
            }
            // Push updates
            for (const update of changes.updates) {
                const { _table, id, ...data } = update;
                if (_table && id) {
                    const collectionName = `${collectionPrefix}${_table}`;
                    await setDoc(doc(this.firestore, collectionName, id.toString()), {
                        ...data,
                        _lastModified: new Date().toISOString(),
                        _source: 'local'
                    }, { merge: true });
                }
            }
            // Push deletes
            for (const del of changes.deletes) {
                if (typeof del === 'object' && '_table' in del && 'id' in del) {
                    const collectionName = `${collectionPrefix}${del._table}`;
                    const { deleteDoc } = await Promise.resolve().then(() => __importStar(require('firebase/firestore')));
                    await deleteDoc(doc(this.firestore, collectionName, del.id.toString()));
                }
                else if (typeof del === 'number') {
                    console.warn('Simple numeric delete ID without table specified - cannot delete from Firebase');
                }
            }
        }
        catch (error) {
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('Firebase push failed')
            });
            throw error;
        }
    }
    async pullChanges() {
        if (!this.firestore)
            throw new Error('Firebase not initialized');
        const { getDocs, collection, query, where, orderBy } = await Promise.resolve().then(() => __importStar(require('firebase/firestore')));
        const collectionPrefix = this.config.collectionPrefix || 'columnist_';
        const changes = {
            inserts: [],
            updates: [],
            deletes: [],
            timestamp: new Date()
        };
        try {
            // Get all tables from schema
            const schema = this.db.getSchema();
            const tables = this.options.tables || Object.keys(schema);
            for (const table of tables) {
                const collectionName = `${collectionPrefix}${table}`;
                const q = query(collection(this.firestore, collectionName), orderBy('_lastModified', 'desc'));
                const snapshot = await getDocs(q);
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    // Skip changes that originated locally
                    if (data._source === 'local')
                        continue;
                    const record = {
                        ...data,
                        id: parseInt(doc.id),
                        _table: table
                    };
                    // Check if this is an update or insert
                    changes.updates.push(record);
                }
            }
        }
        catch (error) {
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('Firebase pull failed')
            });
            throw error;
        }
        return changes;
    }
    async setupRealtimeListeners() {
        if (!this.firestore || !this.options.realtime)
            return;
        const { collection, onSnapshot, query, orderBy } = await Promise.resolve().then(() => __importStar(require('firebase/firestore')));
        const collectionPrefix = this.config.collectionPrefix || 'columnist_';
        const schema = this.db.getSchema();
        const tables = this.options.tables || Object.keys(schema);
        for (const table of tables) {
            const collectionName = `${collectionPrefix}${table}`;
            const q = query(collection(this.firestore, collectionName), orderBy('_lastModified', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added' || change.type === 'modified') {
                        const data = change.doc.data();
                        // Skip changes that originated locally
                        if (data._source === 'local')
                            return;
                        this.emit({
                            type: 'change-detected',
                            table,
                            data: {
                                type: change.type === 'added' ? 'insert' : 'update',
                                record: { ...data, id: parseInt(change.doc.id) }
                            }
                        });
                        // Trigger immediate sync for real-time changes
                        this.sync().catch(console.error);
                    }
                });
            });
            this.realtimeListeners.set(table, unsubscribe);
        }
    }
    teardownRealtimeListeners() {
        for (const unsubscribe of this.realtimeListeners.values()) {
            unsubscribe();
        }
        this.realtimeListeners.clear();
    }
    dispose() {
        this.teardownRealtimeListeners();
        super.dispose();
    }
}
exports.FirebaseSyncAdapter = FirebaseSyncAdapter;
