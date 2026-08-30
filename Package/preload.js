/*
  Electron 预加载脚本
  向渲染进程暴露一个 AppStore：接口与 localStorage 相同，
  但底层把数据写入用户数据目录下的 store.json，实现跨页面同步。
*/
console.log('PRELOAD RUNNING');
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// 从主进程同步获取保存路径
var storePath = ipcRenderer.sendSync('store:get-path');

// 确保目录存在
var dir = path.dirname(storePath);
try {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
} catch (e) {}

function readStore() {
  try {
    var text = fs.readFileSync(storePath, 'utf8');
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return {};
  }
}

function writeStore(data) {
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

var AppStore = {
  getItem: function (key) {
    var value = readStore()[key];
    return value === undefined ? null : value;
  },
  setItem: function (key, value) {
    var data = readStore();
    data[key] = String(value);
    writeStore(data);
  },
  removeItem: function (key) {
    var data = readStore();
    delete data[key];
    writeStore(data);
  },
  clear: function () {
    writeStore({});
  }
};

contextBridge.exposeInMainWorld('AppStore', AppStore);
