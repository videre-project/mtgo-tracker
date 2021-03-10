const { BrowserWindow, app, Tray, Menu } = require('electron');
const { format } = require('url');
const { join } = require('path');
const { sync } = require('glob');
const { statSync, watchFile } = require('fs');
const parser = require('./parser');

// Enable GPU
app.commandLine.appendSwitch('force_high_performance_gpu');

// Configure app protocol
app.setAsDefaultProtocolClient('mtgo-tracker');

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
let tray;

app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 640,
    width: 1024,
    title: 'MTGO Tracker',
    icon: join(__dirname, '../public/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
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

  // Open devtools on local
  if (process.env.ELECTRON_START_URL) mainWindow.webContents.openDevTools();

  // Tasktray icon
  tray = new Tray(join(__dirname, '../public/icon.ico'));
  tray.setToolTip('MTGO Tracker');
  tray.on('click', () => mainWindow.show());
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Update Matchdata',
        click: () => {
          syncMatches();
        },
      },
      { label: 'Separator', type: 'separator' },
      {
        label: 'Quit',
        role: 'quit',
        click: () => {
          app.isQuiting = true;
          app.quit();
        },
      },
    ])
  );

  // Minimize-to-tray behavior
  mainWindow.on('close', event => {
    if (!app.isQuiting) {
      event.preventDefault();

      mainWindow.hide();
    }
  });

  // Dereference the window object on cleanup
  mainWindow.on('closed', () => (mainWindow = tray = null));
});

// Cleanup on close
app.on('window-all-closed', () => app.quit());
