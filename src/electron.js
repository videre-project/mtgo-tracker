const { BrowserWindow, app, Tray, Menu } = require('electron');
const { format } = require('url');
const { join } = require('path');
const { sync } = require('glob');
const { statSync, watchFile } = require('fs');
const { updateMatches } = require('./worker');

// Enable GPU
app.commandLine.appendSwitch('force_high_performance_gpu');

// Configure app protocol
app.setAsDefaultProtocolClient('videre-tracker');

// Set default path to Windows MTGO path
const PATH = join(
  process.env.USERPROFILE,
  '/AppData/Local/Apps/2.0/Data/**/**/**/Data/AppFiles/**'
);

// Select active RecentFilters.xml
const recentFilters = sync(join(PATH, 'RecentFilters.xml')).reduce(
  (activeFilter, filter) => {
    if (statSync(filter).mtime > statSync(activeFilter).mtime) {
      activeFilter = filter;
    }

    return activeFilter;
  }
);

// Initialize main window (UI)
let mainWindow;
let tray;

app.on('ready', () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 640,
    width: 1024,
    title: 'Videre Tracker',
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

  const handleMatchSync = () => {
    updateMatches(PATH, match => {
      mainWindow.webContents.send('match-update', match);
    });
  };

  // Init MTGO daemon
  mainWindow.webContents.on('did-finish-load', () => {
    watchFile(recentFilters, handleMatchSync);
    handleMatchSync();
  });

  // Open devtools on local
  if (process.env.ELECTRON_START_URL) mainWindow.webContents.openDevTools();

  // Tasktray icon
  tray = new Tray(join(__dirname, '../public/icon.ico'));
  tray.setToolTip('Videre Tracker');
  tray.on('click', () => mainWindow.show());
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Update Matches',
        click: () => {
          handleMatchSync();
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
