import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onDevFunction: () => ipcRenderer.send('dev:devFunction'),
  onWinMinimize: () => ipcRenderer.send('window:minimize'),
  onWinMaximize: () => ipcRenderer.send('window:maximize'),
  onWinClose: () => ipcRenderer.send('window:close'),
  onOpenFile: () => ipcRenderer.send('titlebar:openFile'),
  onSaveFile: (listdata) => ipcRenderer.send('titlebar:saveFile', listdata),
  onExportToMiz: (listdata) => ipcRenderer.send('titlebar:exportToMiz', listdata),
  llmGenerate: (data) => ipcRenderer.send('llm:generate', data),
  llmChat: (data) => ipcRenderer.send('llm:chat', data),
  onOllamaList: (data) => ipcRenderer.invoke('ollama:list', data),
  openFolder: (data) => ipcRenderer.send('openFolder', data)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
