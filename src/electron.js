const { BrowserWindow, app } = require('electron');
const url = require('url');
const path = require('path');
const { sync } = require('glob');
const { statSync, watchFile } = require('fs');
const parser = require('./parser');

// Set default path to Windows MTGO path, correct userprofile
const PATH = `${process.env.USERPROFILE.replace('C:', 'C:/')
  .replace('Users', 'Users/')
  .replace('//', '/')}/AppData/Local/Apps/2.0/Data/**/**/**/Data/AppFiles/**`;

// Select active RecentFilters.xml
const [recentFilters] = sync(`${PATH}/RecentFilters.xml`)
  .map(name => ({ name, ...statSync(name) }))
  .sort((a, b) => b.mtime - a.mtime)
  .map(({ name }) => name);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 640,
    width: 1024,
    title: 'MTGO Tracker',
    icon: path.join(__dirname, '/../public/icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
    },
  });

  // Load production app
  const startUrl =
    process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '/../build/index.html'),
      protocol: 'file:',
      slashes: true,
    });
  mainWindow.loadURL(startUrl);

  // Send MTGO match data to app
  const syncMatches = () => {
    const matches = parser(PATH);

    mainWindow.webContents.executeJavaScript(
      `window.localStorage.setItem('matches', JSON.stringify(${JSON.stringify(
        matches
      )}));`
    );
  };

  // Init MTGO daemon
  mainWindow.webContents.on('did-finish-load', () => {
    watchFile(recentFilters, syncMatches);
    syncMatches();
  });

  mainWindow.webContents.openDevTools();

  // Dereference the window object
  mainWindow.on('closed', () => (mainWindow = null));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
