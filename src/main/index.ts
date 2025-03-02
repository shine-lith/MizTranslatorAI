import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import yauzl from 'yauzl'
const luaparse = require('luaparse')
var md5 = require('md5')

const APP_NAME = 'mizTranslatorAI'

// 设置选项的key
const SETID_WINDOWS_BOUNDS = 'WINBOUNDS'
const SETID_TRANSOURCE = 'TRANSOURCE'
const FILE_DB = 'db'

// 字符串资源类型映射/设置表
const TYPE_MAPSETTING = {
  sortie: { text: '1.任务名称', keep: true },
  descriptionText: { text: '2.形势', keep: true },
  descriptionRedTask: { text: '3.红方任务', keep: true },
  descriptionBlueTask: { text: '4.蓝方任务', keep: true },
  descriptionNeutralsTask: { text: '5.中立任务', keep: true },
  WptName: { text: '路点名', keep: false },
  UnitName: { text: '单位名', keep: false },
  GroupName: { text: '群组名', keep: false },
  ActionComment: { keep: false },
  ActionRadioText: { text: '菜单项', keep: true },
  ActionText: { text: '提示信息', keep: true },
  subtitle: { text: '字幕', keep: true }
}

var win
var mizFile = ''
var projectPath = ''
var projectFileNameBase = null
var tranNeedSave = false // tran文件保存状态

const defaultData = { settings: {}, cache: [] }

function createWindow(): void {
  initDb()

  win = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('dev:devFunction', () => {
  console.log('devFunction')

  notification('通知', '这是一个通知', null)
})

ipcMain.on('window:minimize', () => {
  win.minimize()
})

ipcMain.on('titlebar:openFile', async () => {
  openFile()
})

ipcMain.on('closed', () => {
  saveSettingsMenuItem()
  win = null
})

ipcMain.on('close', (e) => {
  saveWindowSettings()
  if (tranNeedSave) {
    e.preventDefault()
    // dialog.showMessageBox(
    //   win,
    //   {
    //     title: APP_NAME,
    //     message: '是否要保存翻译工程?',
    //     buttons: ['保存', '不保存', '取消'],
    //     cancelId: 2
    //   },
    //   (btnId) => {
    //     switch (btnId) {
    //       case 0:
    //         win.webContents.send('callSaveProjectAndClose', 200)
    //         e.preventDefault()
    //         break
    //       case 1:
    //         win = null
    //         app.exit()
    //         break
    //       case 2:
    //       default:
    //         e.preventDefault()
    //     }
    //   }
    // )
  }
})

///////////////////////////////////////////////////////////////////////

// 初始化系统设置存储
function initDb() {
  //db.defaults({ settings: {}, cache: [] }).write()
}

// 从settings中加载
// setid settings的key
// defaultValue 当不存在该值时的默认值
function getSettings(setid, defaultValue) {
  // return db.get('settings').get(setid, defaultValue).value()
}

function saveSettings(setid, value) {
  // db.get('settings').set(setid, value).write()
}

// 保存APP设置
function saveSettingsMenuItem() {
  // var saveMenuItemChecked = (setid) => {
  //   // 保存菜单项的状态到settings
  //   db.get("settings")
  //     // settings 项的格式 setid:value
  //     .set(setid, menuRoot.getMenuItemById(setid).checked)
  //     .write();
  // };
}

function saveWindowSettings() {
  saveSettings(SETID_WINDOWS_BOUNDS, win.getBounds())
}

// 打开...
async function openFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: '选择要打开的DCS World任务文件',
    filters: [{ name: 'DCS World 任务', extensions: ['miz'] }],
    properties: ['openFile']
  })

  if (!canceled && filePaths.length > 0) {
    loadMizFile(filePaths[0])
  }
}

// 读取miz文件
function loadMizFile(file) {
  debugInfo('MainloadMizFile:' + file)
  fs.readFile(file, 'utf8', (err, data) => {
    yauzl.open(file, { lazyEntries: true }, function (err, zipfile) {
      if (err) throw err
      zipfile.readEntry()
      zipfile.on('entry', (entry) => {
        if (entry.fileName === 'l10n/DEFAULT/dictionary') {
          zipfile.openReadStream(entry, function (err, readStream) {
            if (err) throw err
            setProjectWorkPath(file)
            readStream.on('data', function (data) {
              var listData = loadLua(data.toString('utf8'))
              // 过滤掉无需处理的行，加载类型的翻译，如果TYPE_MAPSETTING里没有，则不过滤
              listData = listData.filter((line) => {
                var r = line.key.match(/DictKey_(.*)_\d+/)
                var type = r ? r[1] : 'Text'
                line.type = TYPE_MAPSETTING[type]['text'] ? TYPE_MAPSETTING[type]['text'] : type
                if (TYPE_MAPSETTING[type]) {
                  return TYPE_MAPSETTING[type]['keep'] == true
                } else {
                  return true
                }
              })
              // 添加stamp
              //var stampStart = new Date().getTime(); // 使用时间戳作为标识
              var i = 0
              listData.forEach((line) => {
                //line.translateStamp = stampStart + i++;  // 标识按顺序排
                line.translateStamp = md5(line.originText) // 标识改为原文的md5，相同的内容从cache中获取
              })
              // 尝试加载与工程目录内的翻译工程文件(*.tran)
              var tranData = loadTranFile()
              // 从翻译工程文件中读入到listData
              if (tranData) {
                listData.forEach((line) => {
                  var tranLine = tranData.find((item) => {
                    return item.key == line.key
                  })
                  // 从tran文件中载入译文和翻译戳
                  line.translateText = tranLine.translateText
                  line.translateStamp = tranLine.translateStamp
                })
              }

              // 通知UI 数据已加载
              win.webContents.send('onMizOpen', 200, {
                mizFile: file,
                projectPath: projectPath,
                data: listData
              })
              mizFile = file
            })
          })
        } else {
          zipfile.readEntry()
        }
      })
    })
  })
}

// 清空工作区路径
function clearProjectWorkPath() {
  projectPath = ''
  projectFileNameBase = null
  setAppTitle('')
}

// 设置工作区路径
function setProjectWorkPath(mizFile) {
  projectPath = path.dirname(mizFile)
  projectFileNameBase = mizFile.substring(0, mizFile.length - path.extname(mizFile).length)
  setAppTitle(mizFile)
}

// 读取lua文件
// fileContent lua 代码
function loadLua(fileContent) {
  var events = new (require('events').EventEmitter)()

  Object.keys(luaparse.ast).forEach(function (type) {
    var original = luaparse.ast[type]
    luaparse.ast[type] = function () {
      var node = original.apply(null, arguments)
      events.emit(node.type, node)
      return node
    }
  })

  // debug 用指定的测试文件测试
  // var fileContent = fs.readFileSync(file,"utf-8");
  var listData = Array()
  events.on('TableKey', function (node) {
    var temp = {
      key: node.key.raw,
      originText: node.value.raw
    }
    listData.push(temp)
  })
  luaparse.parse(fileContent)
  return listData
}
// 保存翻译工程
function saveTranFile(data) {
  var fileContent = JSON.stringify(data)
  var tranFilePath = projectFileNameBase + '.tran'
  fs.writeFileSync(tranFilePath, fileContent)
  return tranFilePath
}

// 读取翻译工程文件
function loadTranFile() {
  var tranFile = projectFileNameBase + '.tran'
  if (fs.existsSync(tranFile)) {
    var content = fs.readFileSync(tranFile, 'utf-8')
    debugInfo('found tran file :' + tranFile)
    try {
      var tranObj = JSON.parse(content)
    } catch (e) {
      notification('翻译工程文件有错误', '已跳过读取该文件', null)
      debugInfo("Tran file can't parse")
      return null
    }

    return tranObj
  } else {
    debugInfo('Not found tran file')
    return null
  }
}

// 在UI中显示通知
function notification(msg, desc, onClick) {
  win.webContents.send('onNotification', {
    msg: msg,
    desc: desc,
    onClick: onClick
  })
}

// debug 输出
function debugInfo(str) {
  console.log(str)
}

// 设置软件标题栏文字
function setAppTitle(title) {
  if (title) {
    win.setTitle(`${APP_NAME} - ${title}`)
  } else {
    win.setTitle(APP_NAME)
  }
}
