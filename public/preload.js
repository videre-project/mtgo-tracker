const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tracker', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  subscribe: (channel, listener) => {
    const subscription = (_, ...args) => listener(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
});
