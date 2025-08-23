import '@testing-library/jest-dom';

// Mock IndexedDB for tests
const { indexedDB, IDBKeyRange } = require('fake-indexeddb');

global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;

// Mock structuredClone which is missing in Jest environment
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = function structuredClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Mock window if not present
if (typeof window === 'undefined') {
  global.window = {};
}

// Add requestToPromise utility for testing
const requestToPromise = (req) => {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

global.requestToPromise = requestToPromise;