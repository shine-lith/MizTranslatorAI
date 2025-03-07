<script setup lang="ts">
import { ref } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import TextList from './components/TextList.vue'
import TitleBar from './components/TitleBar.vue'
import { store } from './store.js'

const toast = useToast()
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
const titleBarRef = ref();
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

function onButton() {
  projectPath.value = 'aa'
}
</script>

<template>
  <TitleBar ref="titleBarRef" />
  <Button label="Dev in Vue" @click="onButton" />
  <TextList />
  <Toast />
</template>