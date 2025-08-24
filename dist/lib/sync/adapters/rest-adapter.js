"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESTfulSyncAdapter = void 0;
const base_adapter_1 = require("../base-adapter");
class RESTfulSyncAdapter extends base_adapter_1.BaseSyncAdapter {
    constructor(db, options) {
        super(db, options);
        this.abortController = null;
        this.config = options;
    }
    async initialize() {
        // Validate configuration
        if (!this.config.baseURL) {
            throw new Error('baseURL is required for RESTful sync adapter');
        }
        // Test connection
        try {
            await this.makeRequest('GET', '/health', null, { timeout: 5000 });
            this.emit({ type: 'sync-start' });
        }
        catch (error) {
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('REST API initialization failed')
            });
            throw error;
        }
    }
    async pushChanges(changes) {
        try {
            const endpoint = this.config.endpoints?.sync || '/sync/changes';
            await this.makeRequest('POST', endpoint, {
                changes,
                timestamp: new Date().toISOString(),
                source: 'columnist'
            });
        }
        catch (error) {
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('REST push failed')
            });
            throw error;
        }
    }
    async pullChanges() {
        try {
            const endpoint = this.config.endpoints?.changes || '/sync/changes';
            const response = await this.makeRequest('GET', endpoint);
            if (response && typeof response === 'object') {
                return this.normalizeChangeSet(response);
            }
            return { inserts: [], updates: [], deletes: [], timestamp: new Date() };
        }
        catch (error) {
            this.emit({
                type: 'sync-error',
                error: error instanceof Error ? error : new Error('REST pull failed')
            });
            throw error;
        }
    }
    async setupRealtimeListeners() {
        if (!this.options.realtime)
            return;
        // REST adapters typically don't support real-time listening
        // without WebSocket support, which would be a separate adapter
        console.warn('Real-time listening not supported for REST adapter. Use WebSocket adapter for real-time features.');
    }
    teardownRealtimeListeners() {
        // No real-time listeners to teardown
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
    }
    async makeRequest(method, endpoint, data, options = {}) {
        const url = new URL(endpoint, this.config.baseURL).toString();
        const headers = this.buildHeaders(options.headers);
        const timeout = options.timeout || this.config.timeout || 30000;
        this.abortController = new AbortController();
        const timeoutId = setTimeout(() => {
            this.abortController?.abort();
        }, timeout);
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: data ? JSON.stringify(data) : undefined,
                signal: this.abortController.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
        }
        finally {
            this.abortController = null;
        }
    }
    buildHeaders(additionalHeaders) {
        const headers = {
            'Content-Type': 'application/json',
            ...this.config.headers,
            ...additionalHeaders,
        };
        // Add authentication headers
        if (this.config.auth) {
            switch (this.config.auth.type) {
                case 'bearer':
                    if (this.config.auth.token) {
                        headers['Authorization'] = `Bearer ${this.config.auth.token}`;
                    }
                    break;
                case 'basic':
                    if (this.config.auth.username && this.config.auth.password) {
                        const credentials = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
                        headers['Authorization'] = `Basic ${credentials}`;
                    }
                    break;
                case 'api-key':
                    if (this.config.auth.apiKey) {
                        const headerName = this.config.auth.header || 'X-API-Key';
                        headers[headerName] = this.config.auth.apiKey;
                    }
                    break;
            }
        }
        return headers;
    }
    normalizeChangeSet(data) {
        // Normalize the response from various API formats
        const changes = {
            inserts: Array.isArray(data.inserts) ? data.inserts : [],
            updates: Array.isArray(data.updates) ? data.updates : [],
            deletes: Array.isArray(data.deletes) ? data.deletes : [],
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
        };
        return changes;
    }
    dispose() {
        this.teardownRealtimeListeners();
        super.dispose();
    }
}
exports.RESTfulSyncAdapter = RESTfulSyncAdapter;
