const { join } = require('path');
const { readdirSync, statSync, watchFile } = require('fs');
const { BrowserWindow, app, Tray, Menu } = require('electron');
const { format } = require('url');

// Configure app protocol
app.setAsDefaultProtocolClient('videre-tracker');

// Get the active MTGO directory
const entry = join(process.env.USERPROFILE, '/AppData/Local/Apps/2.0/Data');
const activeDirectory = readdirSync(entry).reduce((path, directory) => {
  const [version] = readdirSync(join(entry, directory));
  const root = join(entry, directory, version);

  const update = readdirSync(root).reduce((current, next) => {
    if (statSync(join(root, current)).ctime < statSync(join(root, next)).ctime) {
      current = next;
    }

    return current;
  });

  path = join(root, update);

  return path;
}, '');

// Identify active user
const UUID = '1821797BF9EDB2222B751BDDE8D9A057';

// Select active working directory
const PATH = join(activeDirectory, 'Data/AppFiles', UUID);

// Select active RecentFilters.xml
const recentFilters = join(PATH, 'RecentFilters.xml');

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
      nodeIntegrationInWorker: true,
      contextIsolation: true,
      preload: join(__dirname, '../public/preload.js'),
    },
  });

  // Connect client to app
  const startURL =
    process.env.ELECTRON_START_URL ||
    format({
      pathname: join(__dirname, '../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });
  mainWindow.loadURL(startURL);

  // Previous match results
  const previousMatches = new Map();

  const handleMatchSync = () => {
    const needsUpdate = readdirSync(PATH).reduce((matches, file, index) => {
      if (!/Match_GameLog_.*\.dat$/.test(file)) return matches;

      const id = file.replace(/Match_GameLog_|\.dat/g, '');
      const filePath = join(PATH, file);

      const match = { id, filePath, index, ...statSync(filePath) };
      const previousMatch = previousMatches.get(id);

      if (!previousMatch || match.ctime > previousMatch.ctime) {
        matches.push(match);

        previousMatches.set(id, match);
      }

      return matches;
    }, []);

    if (needsUpdate.length) {
      mainWindow.webContents.send('match-update', needsUpdate);
    }
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
