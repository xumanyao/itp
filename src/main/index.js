'use strict';

import {app, BrowserWindow, Menu} from 'electron';
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;
const template = [
  {
    label: '操作',
    click: function parentClick () {
      console.log('click the parent tab!');
    },
    submenu: [
      {
        label: '获取仪器列表',
        click: getList // 单击时的回调
      }
    ]
  }
];

function createWindow () {
  mainWindow = new BrowserWindow({
    webPreferences: {webSecurity: false},
    height: 563,
    useContentSize: true,
    width: 1000
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initMenu () {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getList () { // 路由切换
  mainWindow.webContents.send('goLit', true);
}

app.on('ready', createWindow);
app.on('ready', initMenu);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
