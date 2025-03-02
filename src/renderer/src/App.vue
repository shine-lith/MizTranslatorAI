<script setup lang="ts">
import Button from 'primevue/button'
import TextList from './components/TextList.vue'
import TitleBar from './components/TitleBar.vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

import { ref } from 'vue'

const toast = useToast()
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

const mizFile = ref() //miz 文件路径
const projectPath = ref() // 项目路径
const listdata = ref() // miz dict原数据
const searchResult = ref(new Array()) // 查找结果
const searchCurrentIndex = ref(0) // 当前查找结果的游标

window.electron.ipcRenderer.on('onNotification', (e, message, data) => {
  toast.add({ severity: 'secondary', summary: message.msg, detail: message.desc, life: 3000 })
})

// 处理文件加载
window.electron.ipcRenderer.on('onMizOpen', (e, code, data) => {
  if (code == 200) {
    mizFile.value = data.mizFile
    projectPath.value = data.projectPath
    listdata.value = data.data
  }
})

function onButton() {
  projectPath.value = 'aa'
}
</script>

<template>
  <TitleBar />
  <Button label="Dev in Vue" @click="onButton" />
  <TextList :tableData="listdata" :projectPath="projectPath" />
  <Toast />
</template>
]
