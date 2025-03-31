<script setup>
import { ref, computed } from 'vue'
import TitleBar from './components/TitleBar.vue'
import { store } from './store.js'

const titleBarRef = ref()

// 处理文件加载
window.electron.ipcRenderer.on('onMizOpen', (e, code, data) => {
  if (code == 200) {
    store.mizFile = data.mizFile
    store.projectPath = data.projectPath
    store.listdata = data.data
    titleBarRef.value.setTitle(`mizTranslator - ${data.mizFile}`)
  }
})

// 判断miz是否加载
function isMizLoaded() {
  return store.mizFile && store.projectPath ? true : false
}

// 打开文件
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
  <div class="h-screen flex flex-col z-999">
    <TitleBar ref="titleBarRef" @onOpenFile="onOpenFile" @onSaveFile="onSaveFile" />
    <RouterView />
  </div>
</template>
