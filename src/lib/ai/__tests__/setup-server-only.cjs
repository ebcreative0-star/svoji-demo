// Stub 'server-only' for test runner (tsx outside Next.js)
// This file is preloaded via --require before the test
const path = require('node:path');
const serverOnlyPath = require.resolve('server-only');

// Pre-populate require.cache with a no-op stub BEFORE server-only is loaded
require.cache[serverOnlyPath] = {
  id: serverOnlyPath,
  filename: serverOnlyPath,
  loaded: true,
  exports: {},
  children: [],
  paths: [],
  parent: undefined,
  isPreloading: false,
};
