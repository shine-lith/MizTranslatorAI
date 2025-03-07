<script setup>
import { ref } from 'vue'
import TextList from './components/TextList.vue'
import TitleBar from './components/TitleBar.vue'
import TranslationAssistant from './components/TranslationAssistant.vue'
import Button from 'primevue/button'
import { store } from './store.js'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'


const toast = useToast()
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
const titleBarRef = ref()
const projectPath = ref() // 项目路径

window.electron.ipcRenderer.on('onNotification', (e, message, data) => {
  toast.add({ severity: 'secondary', summary: message.msg, detail: message.desc, life: 3000 })
})

// 处理文件加载
window.electron.ipcRenderer.on('onMizOpen', (e, code, data) => {
  if (code == 200) {
    store.mizFile = data.mizFile
    store.projectPath = data.projectPath
    store.listdata = data.data
    titleBarRef.value.setTitle(`mizTranslator - ${data.mizFile}`)
  }
})

function isMizLoaded() {
  return store.mizFile && store.projectPath ? true : false
}

function onOpenFile() {
  window.api.onOpenFile()
}

// 保存翻译工程
function onSaveFile() {
  if (isMizLoaded()) {
    window.api.onSaveFile(JSON.stringify(store.listdata))
  }
}
</script>

<template>
  <TitleBar ref="titleBarRef" @onOpenFile="onOpenFile" @onSaveFile="onSaveFile" />
  <TextList />
  <Toast />
</template>
