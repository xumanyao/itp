'use strict'

import {app, BrowserWindow, Menu, ipcMain} from 'electron'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, miniWindow
let machineData = {}
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`
const template = [
  {
    label: '应用',
    submenu: [
      {
        label: '最小化',
        role: 'minimize'
      },
      {
        label: '重启',
        click: relaunch
      },
      {
        label: '退出',
        role: 'quit'
      }
    ]
  },
  {
    label: '视图',
    submenu: [
      {
        label: '全屏',
        type: 'checkbox',
        role: 'toggleFullScreen'
      },
      /* {
        label: '主题',
        submenu: [
          {
            label: '黑',
            type: 'radio',
            click: () => setTheme('black')
          },
          {
            label: '白',
            type: 'radio',
            checked: true,
            click: () => setTheme('white')
          },
          {
            label: '灰',
            type: 'radio',
            click: () => setTheme('gray')
          }
        ]
      }, */
      {
        label: '放大',
        role: 'zoomin'
      },
      {
        label: '缩小',
        role: 'zoomout'
      },
      {
        label: '重置缩放比例',
        role: 'resetzoom'
      }
    ]
  }, {
    label: '功能',
    submenu: [
      {
        label: '查询仪器类型',
        click: getType
      }, {
        label: '查询仪器列表',
        click: getList // 单击时的回调
      },
      {
        label: '开发者工具',
        role: 'toggledevtools',
        type: 'checkbox',
        checked: true
      }
    ]
  }, {
    label: '帮助',
    submenu: [
      {
        label: '使用文档',
        click: () => {
          mainWindow.webContents.send('infoType', 'useText')
        }
      }, {
        label: '反馈',
        click: () => {
          mainWindow.webContents.send('infoType', 'feedback')
        }
      }
    ]
  }

]

function createWindow () {
  mainWindow = new BrowserWindow({
    webPreferences: {webSecurity: false},
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function initMenu () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function getList () { // 路由切换
  mainWindow.webContents.send('goList', true)
}

function getType () {
  mainWindow.webContents.send('goType', true)
}

function relaunch () {
  app.relaunch()
  app.exit(0)
}

/* function setTheme (color) {
  console.log(color)
  let theme = null
  switch (color) {
    case 'white':
      theme = '#fff'
      break
    case 'black':
      theme = '#000'
      break
    case 'gray' :
      theme = '#939393'
  }
  mainWindow.setBackgroundColor(theme)
} */

app.commandLine.appendSwitch('--disable-http-cache')
app.on('ready', createWindow)
app.on('ready', initMenu)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('openMiniWindow', (event, arg) => { // 点击“使用“按钮时发送数据，执行这个回调
  machineData = arg
  createMinWindow() // 创建子窗口并显示
})
ipcMain.on('miniWindowMounted', (e, data) => { // 子窗口的组件渲染完成触发
  if (data.data) {
    miniWindow.webContents.send('theMachine', machineData.data) // 把对应设备的信息发送给组件
  }
})

function createMinWindow () {
  const modalPath = process.env.NODE_ENV === 'development'
    ? 'http://localhost:9080/#/miniWindow'
    : `file://${__dirname}/index.html#miniWindow`
  miniWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      webSecurity: false
    },
    parent: mainWindow // mainWindow是主窗口
  })
  miniWindow.setMenu(null)
  miniWindow.loadURL(modalPath)
  miniWindow.on('closed', () => {
    miniWindow = null
  })
}
