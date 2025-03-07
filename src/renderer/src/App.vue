<script setup>
import { ref } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import TextList from './components/TextList.vue'
import TitleBar from './components/TitleBar.vue'
import { store } from './store.js'

const toast = useToast()
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
const titleBarRef = ref()
const projectPath = ref() // 项目路径
const listdata = ref(Array)
var ori_data

window.electron.ipcRenderer.on('onNotification', (e, message, data) => {
  toast.add({ severity: 'secondary', summary: message.msg, detail: message.desc, life: 3000 })
})

// 处理文件加载
window.electron.ipcRenderer.on('onMizOpen', (e, code, data) => {
  if (code == 200) {
    store.mizFile = data.mizFile
    store.projectPath = data.projectPath
    ori_data = data.data
    listdata.value = data.data
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
    ori_data.push({})
    window.api.onSaveFile(ori_data)
  }
}
</script>

<template>
  <TitleBar ref="titleBarRef" @onOpenFile="onOpenFile" @onSaveFile="onSaveFile" />
  <TextList :tableData="listdata"/>
  <Toast />
</template>
