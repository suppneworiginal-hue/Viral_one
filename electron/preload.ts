import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// the API endpoints safely
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any Electron-specific APIs here if needed in the future
  platform: process.platform,
});

