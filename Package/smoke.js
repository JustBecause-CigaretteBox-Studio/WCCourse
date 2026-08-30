/*
  验证 Electron 桌面版的本地文件存储是否工作。
  运行：npx electron smoke.js（需要 ELECTRON_RUN_AS_NODE 未设置）
*/
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(app.getPath('userData'), 'store.json');
try {
  if (fs.existsSync(STORE_PATH)) fs.unlinkSync(STORE_PATH);
} catch (e) {}

ipcMain.on('store:get-path', function (event) {
  event.returnValue = STORE_PATH;
});

ipcMain.on('store:write', function (event, data) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data), 'utf8');
  } catch (e) {}
});

app.whenReady().then(function () {
  var win = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  win.webContents.on('did-finish-load', function () {
    win.webContents.executeJavaScript("localStorage.setItem('smoke-key', 'smoke-value'); localStorage.getItem('smoke-key');")
      .then(function (value) {
        console.log('从 localStorage 读回：', value);
        try {
          var data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
          console.log('store.json 内容：', JSON.stringify(data));
          if (data['smoke-key'] === 'smoke-value') {
            console.log('✓ 本地文件存储验证通过');
          } else {
            console.error('✗ store.json 中未找到预期键');
            process.exitCode = 1;
          }
        } catch (e) {
          console.error('✗ 读取 store.json 失败：', e.message);
          process.exitCode = 1;
        }
        app.quit();
      })
      .catch(function (e) {
        console.error('✗ 页面脚本执行失败：', e);
        process.exitCode = 1;
        app.quit();
      });
  });
});
