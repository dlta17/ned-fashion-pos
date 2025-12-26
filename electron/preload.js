
const { contextBridge } = require('electron');

// Expose safe APIs to the renderer process here.
// Since the app currently uses localStorage for data persistence (Local-First),
// we don't need to expose Node.js fs (file system) methods yet.
// This keeps the application secure.

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
});
