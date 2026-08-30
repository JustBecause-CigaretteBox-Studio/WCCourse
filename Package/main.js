/*
  Electron 主进程
  加载 Package/app/index.html，并提供一个本地 JSON 文件作为存储后端。
*/
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// store.json 保存在系统用户数据目录
const STORE_PATH = path.join(app.getPath('userData'), 'store.json');

ipcMain.on('store:get-path', function (event) {
  event.returnValue = STORE_PATH;
});

ipcMain.on('store:write', function (event, data) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data), 'utf8');
  } catch (e) {}
});

function createWindow() {
  var win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '野鸡动画编程课',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // 外部链接全部交给系统浏览器
  win.webContents.setWindowOpenHandler(function (details) {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', function (event, url) {
    if (/^https?:\/\//.test(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
