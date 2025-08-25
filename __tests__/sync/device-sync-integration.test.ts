import { Columnist } from '../../lib/columnist';
import { SyncManager } from '../../lib/sync';

// Mock browser environment for testing
declare global {
  namespace NodeJS {
    interface Global {
      navigator: any;
      screen: any;
    }
  }
}

describe('Device-Sync Integration', () => {
  let db: any;
  let syncManager: SyncManager;

  beforeAll(async () => {
    // Mock browser environment
    global.navigator = {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      platform: 'Win32',
      language: 'en-US',
      hardwareConcurrency: 8,
    };
    
    global.screen = {
      width: 1920,
      height: 1080,
      colorDepth: 24,
    };

    const schema = {
      users: {
        columns: {
          id: "number",
          name: "string",
          email: "string"
        },
        primaryKey: "id"
      },
      devices: {
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
      }
    };

    db = await Columnist.init('test-device-sync-integration', { schema });
    syncManager = db.getSyncManager();
  });

  afterAll(async () => {
    await db?.close?.();
  });

  test('should get device manager from sync manager', () => {
    const deviceManager = syncManager.getDeviceManager();
    expect(deviceManager).toBeDefined();
    expect(typeof deviceManager.getCurrentDevice).toBe('function');
    expect(typeof deviceManager.getAllDevices).toBe('function');
  });

  test('should get device manager from ColumnistDB', async () => {
    const deviceManager = db.getDeviceManager();
    expect(deviceManager).toBeDefined();
    expect(typeof deviceManager.getCurrentDevice).toBe('function');
  });

  test('should get current device from ColumnistDB', async () => {
    const device = await db.getCurrentDevice();
    expect(device).toBeDefined();
    expect(device.deviceId).toBeDefined();
    expect(device.deviceName).toBeDefined();
    expect(device.platform).toBeDefined();
  });

  test('should get all devices from ColumnistDB', async () => {
    const devices = await db.getAllDevices();
    expect(devices).toBeInstanceOf(Array);
    expect(devices.length).toBeGreaterThan(0);
    
    const currentDevice = await db.getCurrentDevice();
    expect(devices.some(d => d.deviceId === currentDevice.deviceId)).toBe(true);
  });

  test('should get online devices from sync manager', async () => {
    const onlineDevices = await syncManager.getOnlineDevices();
    expect(onlineDevices).toBeInstanceOf(Array);
    
    // Should include current device since we just created it
    const currentDevice = await db.getCurrentDevice();
    expect(onlineDevices.some(d => d.deviceId === currentDevice.deviceId)).toBe(true);
  });

  test('should get device status from sync manager', async () => {
    const currentDevice = await db.getCurrentDevice();
    const status = await syncManager.getDeviceStatus(currentDevice.deviceId);
    
    expect(status).toBeDefined();
    expect(['online', 'offline']).toContain(status);
  });

  test('should start device presence tracking from ColumnistDB', async () => {
    // This should not throw an error
    await expect(db.startDevicePresenceTracking(1000)).resolves.not.toThrow();
  });

  test('should start device presence tracking from sync manager', async () => {
    // This should not throw an error
    await expect(syncManager.startDevicePresenceTracking(1000)).resolves.not.toThrow();
  });

  test('should handle device status changes', async () => {
    const currentDevice = await db.getCurrentDevice();
    
    // Get initial status
    const initialStatus = await syncManager.getDeviceStatus(currentDevice.deviceId);
    
    // Status should be either online or offline
    expect(['online', 'offline']).toContain(initialStatus);
  });

  test('should maintain device singleton instance', async () => {
    const deviceManager1 = db.getDeviceManager();
    const deviceManager2 = db.getDeviceManager();
    const deviceManager3 = syncManager.getDeviceManager();
    
    // All should be the same instance
    expect(deviceManager1).toBe(deviceManager2);
    expect(deviceManager1).toBe(deviceManager3);
  });

  test('should integrate with sync adapter registration', async () => {
    // Mock sync adapter that uses device info
    const mockAdapter = {
      start: jest.fn(),
      stop: jest.fn(),
      dispose: jest.fn(),
      getStatus: jest.fn().mockReturnValue({ status: 'idle' }),
      trackChange: jest.fn()
    };
    
    syncManager.registerAdapter('test-device-adapter', mockAdapter as any);
    
    const adapter = syncManager.getAdapter('test-device-adapter');
    expect(adapter).toBeDefined();
    
    // Device manager should still be accessible
    const deviceManager = syncManager.getDeviceManager();
    expect(deviceManager).toBeDefined();
  });

  test('should handle multiple device operations concurrently', async () => {
    const [currentDevice, allDevices, onlineDevices] = await Promise.all([
      db.getCurrentDevice(),
      db.getAllDevices(),
      syncManager.getOnlineDevices()
    ]);
    
    expect(currentDevice).toBeDefined();
    expect(allDevices).toBeInstanceOf(Array);
    expect(onlineDevices).toBeInstanceOf(Array);
    
    // Current device should be in both lists
    expect(allDevices.some(d => d.deviceId === currentDevice.deviceId)).toBe(true);
    expect(onlineDevices.some(d => d.deviceId === currentDevice.deviceId)).toBe(true);
  });
});