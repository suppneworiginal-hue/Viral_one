import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
const BACKEND_PORT = 8000;
const BACKEND_READY_TIMEOUT = 30000; // 30 seconds

function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Determine Python executable path
    const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
    // __dirname is electron/dist, so we need to go up two levels to reach project root
    const backendPath = path.join(__dirname, '..', '..', 'backend', 'start.py');

    // Check if backend file exists
    if (!fs.existsSync(backendPath)) {
      reject(new Error(`Backend file not found: ${backendPath}`));
      return;
    }

    console.log(`Starting backend: ${pythonCommand} ${backendPath}`);

    // Spawn Python backend process
    backendProcess = spawn(pythonCommand, [backendPath], {
      cwd: path.join(__dirname, '..', '..'), // Project root
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    });

    if (!backendProcess) {
      reject(new Error('Failed to spawn backend process'));
      return;
    }

    let backendReady = false;
    const timeout = setTimeout(() => {
      if (!backendReady) {
        backendProcess?.kill();
        reject(new Error('Backend startup timeout'));
      }
    }, BACKEND_READY_TIMEOUT);

    // Monitor stdout for server ready signal
    backendProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`[Backend] ${output.trim()}`);

      // Check for uvicorn startup messages
      if (
        output.includes('Uvicorn running on') ||
        output.includes('Application startup complete') ||
        output.includes(`http://127.0.0.1:${BACKEND_PORT}`)
      ) {
        if (!backendReady) {
          backendReady = true;
          clearTimeout(timeout);
          console.log('Backend server is ready!');
          resolve();
        }
      }
    });

    // Monitor stderr for errors
    backendProcess.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      console.error(`[Backend Error] ${error.trim()}`);
    });

    // Handle process exit
    backendProcess.on('exit', (code, signal) => {
      if (code !== null && code !== 0 && !backendReady) {
        clearTimeout(timeout);
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });

    // Handle process errors
    backendProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start backend: ${error.message}`));
    });
  });
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#000000',
    titleBarStyle: 'default',
  });

  // Load the frontend
  if (process.env.NODE_ENV === 'development') {
    // In development, load from Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function cleanup(): void {
  console.log('Cleaning up...');
  
  if (backendProcess) {
    console.log('Killing backend process...');
    if (process.platform === 'win32') {
      // On Windows, kill the process tree
      spawn('taskkill', ['/F', '/T', '/PID', backendProcess.pid!.toString()], {
        stdio: 'ignore',
        shell: true,
      });
    } else {
      backendProcess.kill('SIGTERM');
    }
    backendProcess = null;
  }
}

// App event handlers
app.whenReady().then(async () => {
  try {
    console.log('Starting backend server...');
    await startBackend();
    console.log('Creating Electron window...');
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    cleanup();
    app.quit();
  }
});

app.on('before-quit', () => {
  cleanup();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  cleanup();
  app.quit();
});

process.on('SIGTERM', () => {
  cleanup();
  app.quit();
});

process.on('SIGINT', () => {
  cleanup();
  app.quit();
});

