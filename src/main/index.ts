import { app, shell, BrowserWindow, ipcMain, dialog, clipboard } from 'electron'
import { join } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import yauzl from 'yauzl'
import { TranslateOllama } from './translate-ollama'

const luaparse = require('luaparse')
const md5 = require('md5')
const APP_NAME = 'mizTranslatorAI'

var win
var mizFile = ''
var projectPath = ''
var projectFileNameBase = null
var tranNeedSave = false // tran文件保存状态

function createWindow(): void {
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

// 访问ollama api 获取已有模型列表
ipcMain.handle('ollama:list', async (e, data) => {
  const ollama = new TranslateOllama({
    host: data.host,
    maxRetries: 1
  })
  try {
    const result = await ollama.getModelList()
    return result
  } catch (error) {
    notification('获取列表失败', '', null)
    return null
  }
})

// ollama 对话请求
ipcMain.on('llm:chat', async (e, data) => {
  const ollama = new TranslateOllama({
    host: data.host,
    maxRetries: 3
  })

  data.context.push({ role: 'user', content: data.originText })
  const request = {
    model: data.model,
    messages: data.context,
    stream: true,
    keep_alive: data.keep_alive,
    options: {
      temperature: data.temperature
    }
  }
  const stream = ollama.chat(request)
  for await (const chunk of stream) {
    var result = {
      ...data,
      ...{
        done: chunk.done,
        chunk: chunk.partial
      }
    }
    win.webContents.send('onTranslateChunk', result)
  }
})

// ollama 生成式请求
ipcMain.on('llm:generate', async (e, data) => {
  const ollama = new TranslateOllama({
    host: data.host,
    maxRetries: 3
  })
  const request = {
    model: data.model,
    prompt: data.prompt,
    system: data.system,
    stream: data.stream,
    keep_alive: data.keep_alive,
    options: {
      temperature: data.temperature
    }
  }
  const stream = ollama.generate(request)
  for await (const chunk of stream) {
    var result = {
      ...data,
      ...{
        done: chunk.done,
        chunk: chunk.partial
      }
    }
    win.webContents.send('onTranslateChunk', result)
  }
})

ipcMain.on('dev:devFunction', () => {
  console.log('devFunction')
  notification('通知', '这是一个通知', null)
  // loadMizFile('/Users/lith/Dev/MizTranslatorAI/Cesar_Syria_[Helicoper_Combat_Rescue].miz')
})

ipcMain.on('titlebar:openFile', async () => {
  openFile()
})

ipcMain.on('closed', () => {
  win = null
})

ipcMain.on('close', (e) => {
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
      handleError('无法打开此文件', '因为文件格式存在问题', 'Cant read miz like zip')
      return
    }
    // 关闭文件的逻辑
    let foundTarget = false
    const cleanup = () => {
      if (zipfile) {
        zipfile.close()
      }
    }

    // 打开dictionary文件
    zipfile.on('entry', (entry) => {
      if (entry.fileName === 'l10n/DEFAULT/dictionary') {
        foundTarget = true
        processDictionary(zipfile, entry, file, cleanup)
      } else {
        zipfile.readEntry()
      }
    })

    //
    zipfile.on('end', () => {
      if (!foundTarget) {
        handleError('无效的任务文件', '缺少必要的字典文件', 'Missing l10n/DEFAULT/dictionary')
        cleanup()
      }
    })

    zipfile.readEntry()
  })
}

// 专用错误处理函数
function handleError(title, message, debugMsg) {
  win.webContents.send('onMizOpen', 400)
  clearProjectWorkPath()
  notification(title, message, null)
  debugInfo(debugMsg)
}

// 处理字典文件的核心逻辑
function processDictionary(zipfile, entry, file, cleanup) {
  zipfile.openReadStream(entry, (err, readStream) => {
    if (err) {
      handleError('无法打开此文件', '文件可能已损坏', 'Cant read l10n/DEFAULT/dictionary')
      cleanup()
      return
    }
    // 分块载入内容
    const chunks: Buffer[] = []
    readStream.on('data', (chunk) => chunks.push(chunk))
    readStream.on('end', () => {
      try {
        const fullContent = Buffer.concat(chunks).toString('utf8')
        const listData = processContent(fullContent)
        sendSuccess(file, listData)
      } catch (exception) {
        handleError('文件解析失败', '内容格式不符合要求', `Parse error: ${exception.message}`)
      } finally {
        cleanup()
      }
    })

    readStream.on('error', (err) => {
      handleError('读取文件失败', '数据流异常中断', `Stream error: ${err.message}`)
      cleanup()
    })
  })
}

// 处理内容解析
function processContent(content) {
  var listData = loadLua(content)
  // 过滤掉原文为空的行
  listData = listData.filter(line => line.originText !== '')
  listData.forEach((line) => {
    line.translateText = ''
    line.translateStamp = md5(line.originText) // 添加翻译标识
    const no = line.key.match(/\d+/g)
    line.no = no ? no[0] : ''
  })

  // 合并翻译数据
  const tranData = loadTranFile()
  if (tranData) {
    listData.forEach((line) => {
      const tranLine = tranData.find((item) => item.key === line.key)
      if (tranLine) {
        line.translateText = tranLine.translateText
        line.translateStamp = tranLine.translateStamp
      }
    })
  }

  return listData
}

// 成功处理
function sendSuccess(file, listData) {
  setProjectWorkPath(file)
  win.webContents.send('onMizOpen', 200, {
    mizFile: file,
    projectPath: projectPath,
    data: listData
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

// 打开文件管理器
ipcMain.on('openFolder', (e, data) => {
  shell.showItemInFolder(data)
})

// 使用外部浏览器打开网页
ipcMain.on('openURL', (e, data) => {
  shell.openExternal(data)
})
