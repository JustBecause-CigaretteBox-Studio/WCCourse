const { app, BrowserWindow } = require('electron');
const path = require('path');
app.whenReady().then(function () {
  var preloadPath = path.join(__dirname, 'preload-minimal.js');
  console.log('preload path:', preloadPath, 'exists:', require('fs').existsSync(preloadPath));
  var win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: false,
      nodeIntegration: false,
      sandbox: false
    }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.webContents.on('did-finish-load', function () {
    win.webContents.executeJavaScript("JSON.stringify({hasAppStore: typeof window.AppStore, keys: Object.keys(window.AppStore||{}), getItem: typeof (window.AppStore||{}).getItem})").then(function (s) {
      console.log('AppStore info:', s);
      app.quit();
    });
  });
});
