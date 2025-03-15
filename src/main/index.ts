import { app, shell, BrowserWindow, ipcMain, dialog, clipboard } from 'electron'
import { join } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import yauzl from 'yauzl'
import { translateService } from './translate-service'
import { TranslateOllama } from './translate-ollama'

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
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
// 设置lowdb 使用JSON序列化进行存储,默认存储的JSON格式是人类友好的格式，空间占用大
var dbAdapter = new FileSync(FILE_DB, {
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data)
})
var db = low(dbAdapter)

function createWindow(): void {
  // 设置Menu
  initDb()
  translateService.setCacheDb(db)

  win = new BrowserWindow({
    frame: false,
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: '/app.ico'
  })

  win.setTitle(APP_NAME)
  var bounds = getSettings(SETID_WINDOWS_BOUNDS, null)
  if (bounds) win.setBounds(bounds)

  win.on('ready-to-show', () => {
    win.show()
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 监听页面加载完成事件
  win.webContents.on('did-finish-load', () => {
    // for dev auto run something
    loadMizFile('./demo.miz')
  });

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
ipcMain.handle('translate:single', async (e, data)=> {

  const translator = new TranslateOllama({
    host: 'http://192.168.1.12:11434',
    model: 'deepseek-r1:32b',
    maxRetries: 3
  })

  const result = await translator.translate(data.originText)
  return result.result
})

ipcMain.on('translate:chunk', async (e, data) => {
  const translator = new TranslateOllama({
    host: 'http://192.168.1.12:11434',
    model: 'huihui_ai/qwq-abliterated:latest',
    maxRetries: 3
  })

  const stream = translator.translateStream(data.originText)
  for await (const chunk of stream) {
    var result = { ...data, ...{
      done: chunk.done,
      chunk: chunk.partial
    } }

    win.webContents.send('onTranslateChunk', result)
  }
})

ipcMain.on('dev:devFunction', () => {
  console.log('devFunction')
  // notification('通知', '这是一个通知', null)
  // loadMizFile('/Users/lith/Dev/MizTranslatorAI/Cesar_Syria_[Helicoper_Combat_Rescue].miz')

  // 初始化带配置的实例
  const translator = new TranslateOllama({
    host: 'http://127.0.0.1:11434',
    model: 'deepseek-r1:7b',
    maxRetries: 5
  })

  const t = async () => {
    var originText =
      'Army Black Hawk helicopters, damaging at least one that managed to return to base. Then, at 2 a.m. on 25 September—a week before the Battle of Mogadishu—the SNA used an RPG to shoot down a Black Hawk (callsign Courage 53) while it was on patrol.'
    // 流式翻译（不使用缓存）
    const stream = translator.translateStream(originText, { skipCache: true })
    for await (const chunk of stream) {
      console.log('Partial:', chunk.partial)
    }
  }
  t()

  // translateService.translate(
  //   ["ollama"],
  //   "aaa",
  //   "你好",
  //   (source, work, result) => {
  //     console.log('reulst');
  //     win.webContents.send("onTranslation", 200, {
  //       source: source,
  //       request: work,
  //       response: result,
  //     });
  //   },
  //   false,
  //   null
  // );
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

    var response = dialog.showMessageBoxSync(win, {
      title: APP_NAME,
      message: '是否要保存翻译工程?',
      buttons: ['保存', '不保存', '取消'],
      cancelId: 2
    })

    switch (response) {
      case 0:
        win.webContents.send('callSaveProjectAndClose', 200)
        e.preventDefault()
        break
      case 1:
        win = null
        app.exit()
        break
      case 2:
      default:
        e.preventDefault()
    }
  }
})

///////////////////////////////////////////////////////////////////////

// 初始化系统设置存储
function initDb() {
  db.defaults({ settings: {}, cache: [] }).write()
}

// 从settings中加载
// setid settings的key
// defaultValue 当不存在该值时的默认值
function getSettings(setid, defaultValue) {
  return db.get('settings').get(setid, defaultValue).value()
}

function saveSettings(setid, value) {
  db.get('settings').set(setid, value).write()
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
  yauzl.open(file, { lazyEntries: true }, (err, zipfile) => {
    if (err) {
      handleError('无法打开此文件', '因为文件格式存在问题', 'Cant read miz like zip');
      return;
    }
    // 关闭文件的逻辑
    let foundTarget = false;
    const cleanup = () => {
      if (zipfile) {
        zipfile.close();
      }
    };

    // 打开dictionary文件
    zipfile.on('entry', (entry) => {
      if (entry.fileName === 'l10n/DEFAULT/dictionary') {
        foundTarget = true;
        processDictionary(zipfile, entry, file, cleanup);
      } else {
        zipfile.readEntry();
      }
    });

    // 
    zipfile.on('end', () => {
      if (!foundTarget) {
        handleError('无效的任务文件', '缺少必要的字典文件', 'Missing l10n/DEFAULT/dictionary');
        cleanup();
      }
    });

    zipfile.readEntry();
  });
}

// 专用错误处理函数
function handleError(title, message, debugMsg) {
  win.webContents.send('onMizOpen', 400);
  clearProjectWorkPath();
  notification(title, message, null);
  debugInfo(debugMsg);
}

// 处理字典文件的核心逻辑
function processDictionary(zipfile, entry, file, cleanup) {
  zipfile.openReadStream(entry, (err, readStream) => {
    if (err) {
      handleError('无法打开此文件', '文件可能已损坏', 'Cant read l10n/DEFAULT/dictionary');
      cleanup();
      return;
    }
    // 分块载入内容
    const chunks = [];
    readStream.on('data', (chunk) => chunks.push(chunk));
    readStream.on('end', () => {
      try {
        const fullContent = Buffer.concat(chunks).toString('utf8');
        const listData = processContent(fullContent);
        sendSuccess(file, listData);
      } catch (e) {
        handleError('文件解析失败', '内容格式不符合要求', `Parse error: ${e.message}`);
      } finally {
        cleanup();
      }
    });

    readStream.on('error', (err) => {
      handleError('读取文件失败', '数据流异常中断', `Stream error: ${err.message}`);
      cleanup();
    });
  });
}

// 处理内容解析
function processContent(content) {
  const listData = loadLua(content).filter(line => {
    const r = line.key.match(/DictKey_(.*)_\d+/);
    const type = r ? r[1] : 'Text';
    line.type = TYPE_MAPSETTING[type]?.text || type;
    return TYPE_MAPSETTING[type] ? TYPE_MAPSETTING[type].keep : true;
  });

  listData.forEach(line => {
    line.translateText = ''
    line.translateStamp = md5(line.originText);   // 添加翻译标识
  });

  // 合并翻译数据
  const tranData = loadTranFile();
  if (tranData) {
    listData.forEach(line => {
      const tranLine = tranData.find(item => item.key === line.key);
      if (tranLine) {
        line.translateText = tranLine.translateText;
        line.translateStamp = tranLine.translateStamp;
      }
    });
  }

  return listData;
}

// 成功处理
function sendSuccess(file, listData) {
  setProjectWorkPath(file);
  win.webContents.send('onMizOpen', 200, {
    mizFile: file,
    projectPath: projectPath,
    data: listData
  });
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
  console.log(fileContent)
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
      key: node.key.value,
      originText: node.value.value
    }
    listData.push(temp)
  })
  luaparse.parse(fileContent)
  return listData
}
// 保存翻译工程
function saveTranFile(json_data) {
  //var fileContent = JSON.stringify(data)
  var tranFilePath = projectFileNameBase + '.tran'
  fs.writeFileSync(tranFilePath, json_data)
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

//////////////////////////////菜单响应///////////////////////////////////
// 清理翻译缓存
function cleanTranslateCache() {
  var bytetostring = (bytes) => {
    if (bytes < 1024) return bytes + 'B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + 'KB'
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + 'MB'
    else return (bytes / 1073741824).toFixed(3) + 'GB'
  }
  var dbStat = fs.statSync(FILE_DB)
  db.get('cache').remove().write()
  notification('翻译缓存已清除', '释放 ' + bytetostring(dbStat.size) + ' 空间', null)
}

//////////////////////////////UI消息响应///////////////////////////////////
ipcMain.on('window:minimize', () => win.minimize())

//最大化
ipcMain.on('window:maximize', function () {
  if (win.isMaximized()) {
    win.restore()
  } else {
    win.maximize()
  }
})

ipcMain.on('window:close', () => win.close())

ipcMain.on('getSettings', (e, setid) => {
  var value = getSettings(setid, null)
})

// 复制文字到剪贴板
ipcMain.on('textToClipboard', (e, text) => {
  clipboard.writeText(text)
  notification('内容已复制', '', null)
})

// 打开文件
ipcMain.on('openFile', (e) => {
  openFile()
})

// 保存工程并关闭
ipcMain.on('onCloseAndSaveProject', (e, data) => {
  saveTranFile(data)
  win = null
  app.exit()
})

// 保存工程
ipcMain.on('titlebar:saveFile', (e, data) => {
  var tranFilePath = saveTranFile(data)
  notification('工程已保存', "<span class='action'>点击此处打开保存位置</span>", {
    method: 'openFolder',
    args: tranFilePath
  })
  tranNeedSave = false
})

// 导出miz文件
ipcMain.on('exportToMiz', (e, d) => {
  const DCS_DICT_STR_BR = '\\\n'

  // 将文本转换为DCS Dict的格式
  var toDcsDictStr = function (str) {
    var str = str.replace(new RegExp('\n', 'gm'), DCS_DICT_STR_BR) // 过滤换行 把换行转为 \
    str = str.replace(new RegExp('"', 'gm'), '\\"') // 过滤 双引号
    return str
  }

  // 生成DCS miz里Dictionary文件内容
  // var buildDcsDictionaryContent = function(data) {
  //   var dictionaryContent = ''
  //   dictionaryContent += 'dictionary = \n{\n'
  //   data.forEach((item) => {
  //     if (item.translateText) {
  //       var key = item.key
  //       var translateText = toDcsDictStr(item.translateText)
  //       // if (store.translate_compare) {
  //         // 对照模式 把原文加到译文里
  //         translateText =
  //           toDcsDictStr(item.originText) + DCS_DICT_STR_BR + DCS_DICT_STR_BR + DCS_DICT_STR_BR + translateText
  //       // }
  //       dictionaryContent += `    ['${key}'] = '${translateText}',\n`
  //     }
  //   })
  //   dictionaryContent += '} -- end of dictionary\n'
  //   return dictionaryContent
  // }

  // var exportMiz = async function(mizFile, exportMizFile, dataTable) {
  // var dictionaryContent = buildDcsDictionaryContent(dataTable)
  // 往副本中添加翻译文件
  //   fs.readFile(mizFile, (err, data) => {
  //     var zip = new JSzip()
  //     zip.loadAsync(data).then(
  //       (zip) => {
  //         zip.file('l10n/CN/dictionary', dictionaryContent)
  //         zip
  //           .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
  //           .pipe(fs.createWriteStream(exportMizFile))
  //           .on('finish', () => {
  //             debugInfo('Export miz file : ' + exportMizFile)
  //             notification('打包完成', '<span class=\'action\'>点击此处打开保存位置</span>', {
  //               method: 'openFolder',
  //               args: exportMizFile,
  //             })
  //           })
  //       },
  //       (error) => {
  //         debugInfo('Export miz fail')
  //       }
  //     )
  //   })
  // }

  // var data = d.data
  // var store = d.store

  // if (fs.existsSync(mizFile)) {
  //   if (store.merge_to_miz) {
  //     if (store.backup_orign_miz) { //备份原文件
  //       fs.copyFileSync(mizFile, projectFileNameBase + '_Backup.miz')
  //     }
  //     exportMiz(mizFile, mizFile, data) // 覆盖到原文件
  //   } else {
  //     //让用户选择打包位置

  //     const { canceled, filePath } = await dialog.showSaveDialog({
  //       title: '保存到',
  //       defaultPath: projectFileNameBase + '_CN.miz',
  //       filters: [{ name: 'DCS World 任务', extensions: ['miz'] }],
  //     })

  //     if (!canceled) {
  //       exportMiz(mizFile, filePath, data)
  //     }
  //   }
  // } else {
  //   notification('打包失败，原文件不存在!', '', null)
  //   debugInfo('mizFile not exist')
  // }
})

// 存在新的修改
ipcMain.on('onTranslateTextChange', (e) => {
  tranNeedSave = true
})

// 清除翻译缓存
ipcMain.on('cleanTranslateCache', (e) => {
  cleanTranslateCache()
})

// 打开文件管理器
ipcMain.on('openFolder', (e, data) => {
  shell.showItemInFolder(data)
})

// 使用外部浏览器打开网页
ipcMain.on('openURL', (e, data) => {
  shell.openExternal(data)
})

// 保存到db Setting
ipcMain.on('saveSetting', (e, data) => {
  var settings = getSettings(data.key, null)
  var value
  if (settings) {
    value = Object.assign(settings, data.value)
  } else {
    value = data.value
  }
  saveSettings(data.key, value)
})

// 翻译文字
ipcMain.on('translation', (e, data) => {
  if (data.source.length > 0) {
    translateService.translate(
      data.source,
      data.id,
      data.text,
      (source, work, result) => {
        win.webContents.send('onTranslation', 200, {
          source: source,
          request: work,
          response: result
        })
      },
      false,
      data.store
    )
  } else {
    notification('无法加载翻译', '请在偏好设置中启用一个翻译来源', null)
    win.webContents.send('onTranslation', 400)
  }
})
