import { Columnist } from '../../lib/columnist';
import { getDeviceManager, DeviceInfo } from '../../lib/sync/device-utils';

// Mock browser environment for testing
declare global {
  namespace NodeJS {
    interface Global {
      navigator: any;
      screen: any;
    }
  }
}

describe('Device Manager', () => {
  let db: any;
  let deviceManager: any;

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

    db = await Columnist.init('test-device-db', {
      schema: {
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
      }
    });

    deviceManager = getDeviceManager(db);
  });

  afterAll(async () => {
    await db?.close?.();
  });

  test('should generate device fingerprint', async () => {
    const fingerprint = (deviceManager as any).generateDeviceFingerprint();
    expect(fingerprint).toBeDefined();
    expect(typeof fingerprint).toBe('string');
    expect(fingerprint.length).toBeGreaterThan(0);
  });

  test('should detect device capabilities', async () => {
    const capabilities = (deviceManager as any).detectCapabilities();
    expect(capabilities).toBeDefined();
    expect(capabilities).toHaveProperty('offline');
    expect(capabilities).toHaveProperty('realtime');
    expect(capabilities).toHaveProperty('encryption');
  });

  test('should get or create current device', async () => {
    const device = await deviceManager.getCurrentDevice();
    expect(device).toBeDefined();
    expect(device.deviceId).toBeDefined();
    expect(device.deviceName).toBeDefined();
    expect(device.platform).toBeDefined();
    expect(device.os).toBeDefined();
    expect(device.capabilities).toBeInstanceOf(Array);
    expect(device.createdAt).toBeInstanceOf(Date);
    expect(device.lastSeen).toBeInstanceOf(Date);
  });

  test('should get device by ID', async () => {
    const currentDevice = await deviceManager.getCurrentDevice();
    const device = await deviceManager.getDevice(currentDevice.deviceId);
    
    expect(device).toBeDefined();
    expect(device?.deviceId).toBe(currentDevice.deviceId);
    expect(device?.deviceName).toBe(currentDevice.deviceName);
  });

  test('should update last seen timestamp', async () => {
    const currentDevice = await deviceManager.getCurrentDevice();
    const originalLastSeen = currentDevice.lastSeen;
    
    await deviceManager.updateLastSeen(currentDevice.deviceId);
    
    const updatedDevice = await deviceManager.getDevice(currentDevice.deviceId);
    expect(updatedDevice?.lastSeen.getTime()).toBeGreaterThan(originalLastSeen.getTime());
  });

  test('should get all devices', async () => {
    const devices = await deviceManager.getAllDevices();
    expect(devices).toBeInstanceOf(Array);
    expect(devices.length).toBeGreaterThan(0);
    
    const currentDevice = await deviceManager.getCurrentDevice();
    expect(devices.some(d => d.deviceId === currentDevice.deviceId)).toBe(true);
  });

  test('should generate friendly device name', () => {
    const deviceName = (deviceManager as any).generateDeviceName();
    expect(deviceName).toBeDefined();
    expect(typeof deviceName).toBe('string');
    expect(deviceName.length).toBeGreaterThan(0);
    expect(deviceName).toMatch(/^[A-Za-z]+ [A-Za-z]+$/);
  });

  test('should detect operating system', () => {
    const os = (deviceManager as any).detectOS();
    expect(os).toBeDefined();
    expect(typeof os).toBe('string');
  });

  test('should detect browser', () => {
    const browser = (deviceManager as any).detectBrowser();
    expect(browser).toBeDefined();
    expect(typeof browser).toBe('string');
  });

  test('should convert capabilities to array', () => {
    const capabilities = {
      offline: true,
      realtime: false,
      backgroundSync: true,
      compression: false,
      encryption: true,
      largeStorage: false
    };
    
    const capabilitiesArray = (deviceManager as any).capabilitiesToArray(capabilities);
    expect(capabilitiesArray).toBeInstanceOf(Array);
    expect(capabilitiesArray).toContain('offline');
    expect(capabilitiesArray).toContain('backgroundSync');
    expect(capabilitiesArray).toContain('encryption');
    expect(capabilitiesArray).not.toContain('realtime');
  });
});