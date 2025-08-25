import { ColumnistDB } from '../columnist';
export interface DeviceInfo {
    deviceId: string;
    deviceName: string;
    platform: string;
    os: string;
    browser?: string;
    screenResolution?: string;
    language: string;
    timezone: string;
    capabilities: string[];
    createdAt: Date;
    lastSeen: Date;
    syncProtocolVersion: string;
}
export interface DeviceCapabilities {
    offline: boolean;
    realtime: boolean;
    backgroundSync: boolean;
    compression: boolean;
    encryption: boolean;
    largeStorage: boolean;
}
export declare class DeviceManager {
    private db;
    private currentDeviceId;
    constructor(db: ColumnistDB);
    /**
     * Ensure device table exists in database schema
     */
    private ensureDeviceTable;
    /**
     * Generate a unique device fingerprint
     */
    private generateDeviceFingerprint;
    /**
     * Simple string hash function
     */
    private hashString;
    /**
     * Detect device capabilities
     */
    private detectCapabilities;
    /**
     * Get or create current device info
     */
    getCurrentDevice(): Promise<DeviceInfo>;
    /**
     * Generate a friendly device name
     */
    private generateDeviceName;
    /**
     * Detect operating system
     */
    private detectOS;
    /**
     * Detect browser
     */
    private detectBrowser;
    /**
     * Convert capabilities object to string array
     */
    private capabilitiesToArray;
    /**
     * Get device by ID
     */
    getDevice(deviceId: string): Promise<DeviceInfo | null>;
    /**
     * Update device last seen timestamp
     */
    updateLastSeen(deviceId: string): Promise<void>;
    /**
     * Get all known devices
     */
    getAllDevices(): Promise<DeviceInfo[]>;
    /**
     * Remove a device
     */
    removeDevice(deviceId: string): Promise<void>;
    /**
     * Get current device ID
     */
    getCurrentDeviceId(): string | null;
    /**
     * Start device presence tracking with heartbeat
     */
    startPresenceTracking(heartbeatInterval?: number): Promise<void>;
    /**
     * Update device status (online/offline)
     */
    private updateDeviceStatus;
    /**
     * Get online devices
     */
    getOnlineDevices(): Promise<DeviceInfo[]>;
    /**
     * Get device status (online if last seen within 5 minutes)
     */
    getDeviceStatus(deviceId: string): Promise<'online' | 'offline'>;
}
export declare function getDeviceManager(db?: ColumnistDB): DeviceManager;
//# sourceMappingURL=device-utils.d.ts.map