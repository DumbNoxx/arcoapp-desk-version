const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  closeWindow: () => ipcRenderer.send('window-close'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  restoreWindow: () => ipcRenderer.send('window-restore'),
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
  quitApp: () => ipcRenderer.send('app-quit'),
  onSleepMode: (callback) => ipcRenderer.on('sleep-mode', (_event, value) => callback(value)),
  getAutoLaunchStatus: () => ipcRenderer.invoke('get-autolaunch-status'),
  setAutoLaunchStatus: (flag) => ipcRenderer.send('set-autolaunch-status', flag),
  setNotificationsStatus: (flag) => ipcRenderer.send('set-notifications-status', flag),
  setRunInBackgroundStatus: (flag) => ipcRenderer.send('set-run-in-background-status', flag),
  getRunInBackgroundStatus: () => ipcRenderer.invoke('get-run-in-background-status'),
  sendRateNotification: (title, body) => ipcRenderer.send('send-rate-notification', { title, body }),
  // Update events
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_event, value) => callback(value)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_event, value) => callback(value)),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  restartApp: () => ipcRenderer.send('restart_app'),
});
