const { BrowserWindow, app } = require('electron');
const { format } = require('url');
const { join } = require('path');
const { sync } = require('glob');
const { statSync, watchFile } = require('fs');
const parser = require('./parser');

// Set default path to Windows MTGO path
const PATH = join(
  process.env.USERPROFILE,
  '/AppData/Local/Apps/2.0/Data/**/**/**/Data/AppFiles/**'
);

// Select active RecentFilters.xml
const [recentFilters] = sync(join(PATH, 'RecentFilters.xml'))
  .map(name => ({ name, ...statSync(name) }))
  .sort((a, b) => b.mtime - a.mtime)
  .map(({ name }) => name);

// Initialize main window (UI)
let mainWindow;

app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    resizable: false,
    height: 640,
    width: 1024,
    title: 'MTGO Tracker',
    icon: join(__dirname, '../public/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../public/preload.js'),
    },
  });

  // Connect client to app
  const startUrl =
    process.env.ELECTRON_START_URL ||
    format({
      pathname: join(__dirname, '../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });
  mainWindow.loadURL(startUrl);

  // Previous match results
  let previousMatches;

  // Send MTGO match data to app
  const syncMatches = () => {
    const matches = parser(PATH);

    const needsUpdate = matches?.some(match => {
      const duplicate = previousMatches?.find(({ id }) => match.id === id);
      if (!duplicate) return true;

      return JSON.stringify(match) !== JSON.stringify(duplicate);
    });

    if (needsUpdate) {
      previousMatches = matches.slice(0);
      mainWindow.webContents.send('matches', matches);
    }
  };

  // Init MTGO daemon
  mainWindow.webContents.on('did-finish-load', () => {
    watchFile(recentFilters, syncMatches);
    syncMatches();
  });

  // Dereference the window object
  mainWindow.on('closed', () => (mainWindow = null));
});

// Cleanup on close
app.on('window-all-closed', () => app.quit());
