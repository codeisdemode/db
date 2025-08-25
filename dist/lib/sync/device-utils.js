"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceManager = void 0;
exports.getDeviceManager = getDeviceManager;
const columnist_1 = require("../columnist");
class DeviceManager {
    constructor(db) {
        this.currentDeviceId = null;
        this.db = db;
        // Ensure device table exists in schema
        this.ensureDeviceTable();
    }
    /**
     * Ensure device table exists in database schema
     */
    ensureDeviceTable() {
        const currentSchema = this.db.getSchema();
        if (!currentSchema.devices) {
            this.db.defineSchema({
                ...currentSchema,
                devices: columnist_1.DeviceTableSchema
            });
        }
    }
    /**
     * Generate a unique device fingerprint
     */
    generateDeviceFingerprint() {
        // Combine multiple stable identifiers for reliable fingerprinting
        const identifiers = [];
        // User agent and platform info
        if (typeof navigator !== 'undefined') {
            identifiers.push(navigator.userAgent);
            identifiers.push(navigator.platform);
            identifiers.push(navigator.language);
            identifiers.push(navigator.hardwareConcurrency?.toString() || '1');
            // Screen properties
            if (screen) {
                identifiers.push(`${screen.width}x${screen.height}`);
                identifiers.push(screen.colorDepth?.toString() || '24');
            }
        }
        // Timezone
        identifiers.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
        // Generate hash from combined identifiers
        const combined = identifiers.join('|');
        return this.hashString(combined);
    }
    /**
     * Simple string hash function
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }
    /**
     * Detect device capabilities
     */
    detectCapabilities() {
        const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
        const isNode = typeof process !== 'undefined' && process.versions?.node;
        return {
            offline: isBrowser ? 'serviceWorker' in navigator : true,
            realtime: isBrowser ? 'WebSocket' in window : true,
            backgroundSync: isBrowser ? 'serviceWorker' in navigator && 'sync' in navigator.serviceWorker : false,
            compression: true, // Most environments support compression
            encryption: typeof crypto !== 'undefined' && 'subtle' in crypto,
            largeStorage: isBrowser ? 'storage' in navigator && 'estimate' in navigator.storage : true
        };
    }
    /**
     * Get or create current device info
     */
    async getCurrentDevice() {
        if (this.currentDeviceId) {
            const device = await this.getDevice(this.currentDeviceId);
            if (device)
                return device;
        }
        const fingerprint = this.generateDeviceFingerprint();
        const capabilities = this.detectCapabilities();
        // Try to find existing device by fingerprint
        const existingDevices = await this.db.find({
            table: 'devices',
            where: { deviceId: fingerprint }
        });
        if (existingDevices.length > 0) {
            this.currentDeviceId = fingerprint;
            return existingDevices[0];
        }
        // Create new device
        const deviceInfo = {
            deviceId: fingerprint,
            deviceName: this.generateDeviceName(),
            platform: typeof navigator !== 'undefined' ? navigator.platform : 'node',
            os: this.detectOS(),
            browser: this.detectBrowser(),
            screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : undefined,
            language: typeof navigator !== 'undefined' ? navigator.language : 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            capabilities: this.capabilitiesToArray(capabilities),
            createdAt: new Date(),
            lastSeen: new Date(),
            syncProtocolVersion: '1.0'
        };
        await this.db.insert(deviceInfo, 'devices');
        this.currentDeviceId = fingerprint;
        return deviceInfo;
    }
    /**
     * Generate a friendly device name
     */
    generateDeviceName() {
        const prefixes = ['Swift', 'Smart', 'Mobile', 'Desktop', 'Tablet', 'Laptop'];
        const suffixes = ['Device', 'Machine', 'Unit', 'Terminal', 'Station'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        return `${randomPrefix} ${randomSuffix}`;
    }
    /**
     * Detect operating system
     */
    detectOS() {
        if (typeof navigator === 'undefined')
            return 'unknown';
        const userAgent = navigator.userAgent;
        if (/windows/i.test(userAgent))
            return 'Windows';
        if (/macintosh|mac os x/i.test(userAgent))
            return 'macOS';
        if (/linux/i.test(userAgent))
            return 'Linux';
        if (/android/i.test(userAgent))
            return 'Android';
        if (/ios|iphone|ipad|ipod/i.test(userAgent))
            return 'iOS';
        return 'Unknown';
    }
    /**
     * Detect browser
     */
    detectBrowser() {
        if (typeof navigator === 'undefined')
            return 'node';
        const userAgent = navigator.userAgent;
        if (/edg/i.test(userAgent))
            return 'Edge';
        if (/chrome/i.test(userAgent))
            return 'Chrome';
        if (/safari/i.test(userAgent))
            return 'Safari';
        if (/firefox/i.test(userAgent))
            return 'Firefox';
        if (/opera|opr/i.test(userAgent))
            return 'Opera';
        return 'Unknown';
    }
    /**
     * Convert capabilities object to string array
     */
    capabilitiesToArray(capabilities) {
        return Object.entries(capabilities)
            .filter(([_, value]) => value)
            .map(([key]) => key);
    }
    /**
     * Get device by ID
     */
    async getDevice(deviceId) {
        const devices = await this.db.find({
            table: 'devices',
            where: { deviceId },
            limit: 1
        });
        return devices.length > 0 ? devices[0] : null;
    }
    /**
     * Update device last seen timestamp
     */
    async updateLastSeen(deviceId) {
        await this.db.update(deviceId, { lastSeen: new Date() }, 'devices');
    }
    /**
     * Get all known devices
     */
    async getAllDevices() {
        const devices = await this.db.find({
            table: 'devices',
            orderBy: { field: 'lastSeen', direction: 'desc' }
        });
        return devices;
    }
    /**
     * Remove a device
     */
    async removeDevice(deviceId) {
        await this.db.delete(deviceId, 'devices');
    }
    /**
     * Get current device ID
     */
    getCurrentDeviceId() {
        return this.currentDeviceId;
    }
    /**
     * Start device presence tracking with heartbeat
     */
    async startPresenceTracking(heartbeatInterval = 30000) {
        if (typeof window === 'undefined') {
            console.warn('Presence tracking only available in browser environments');
            return;
        }
        // Initial heartbeat
        await this.updateLastSeen(this.currentDeviceId);
        // Set up periodic heartbeat
        setInterval(async () => {
            if (this.currentDeviceId) {
                await this.updateLastSeen(this.currentDeviceId);
            }
        }, heartbeatInterval);
        // Track online/offline status
        if (window.addEventListener) {
            window.addEventListener('online', () => {
                this.updateDeviceStatus(this.currentDeviceId, 'online');
            });
            window.addEventListener('offline', () => {
                this.updateDeviceStatus(this.currentDeviceId, 'offline');
            });
        }
        console.log('Device presence tracking started');
    }
    /**
     * Update device status (online/offline)
     */
    async updateDeviceStatus(deviceId, status) {
        try {
            await this.db.update(deviceId, {
                status,
                lastStatusChange: new Date()
            }, 'devices');
        }
        catch (error) {
            console.warn('Failed to update device status:', error);
        }
    }
    /**
     * Get online devices
     */
    async getOnlineDevices() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const devices = await this.db.find({
            table: 'devices',
            where: {
                lastSeen: { $gte: fiveMinutesAgo }
            }
        });
        return devices;
    }
    /**
     * Get device status (online if last seen within 5 minutes)
     */
    async getDeviceStatus(deviceId) {
        const device = await this.getDevice(deviceId);
        if (!device)
            return 'offline';
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        return device.lastSeen >= fiveMinutesAgo ? 'online' : 'offline';
    }
}
exports.DeviceManager = DeviceManager;
/**
 * Singleton device manager instance
 */
let deviceManagerInstance = null;
function getDeviceManager(db) {
    if (!deviceManagerInstance && db) {
        deviceManagerInstance = new DeviceManager(db);
    }
    if (!deviceManagerInstance) {
        throw new Error('DeviceManager not initialized. Call getDeviceManager(db) first.');
    }
    return deviceManagerInstance;
}
