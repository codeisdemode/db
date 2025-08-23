// Node.js compatibility layer for Columnist
// Provides basic IndexedDB mocking for testing in Node.js environments

if (typeof window === 'undefined' && typeof indexedDB === 'undefined') {
  const { indexedDB, IDBKeyRange } = require('fake-indexeddb');
  
  global.indexedDB = indexedDB;
  global.IDBKeyRange = IDBKeyRange;
  
  // Mock structuredClone for Node.js
  if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = function structuredClone(obj) {
      return JSON.parse(JSON.stringify(obj));
    };
  }
  
  // Mock window object
  if (typeof global.window === 'undefined') {
    global.window = {};
  }
  
  console.log('Columnist: Node.js compatibility layer activated');
}

export {};