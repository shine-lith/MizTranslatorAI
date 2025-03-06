<script setup lang="ts">
import { ref } from 'vue'
import TextList from './components/TextList.vue'
import TitleBar from './components/TitleBar.vue'
import TranslationAssistant from './components/TranslationAssistant.vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'


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
</script>

<template>
  <TitleBar />
  <div class="flex">
    <div class="flex-auto">
      <TextList :tableData="listdata" :projectPath="projectPath" />
    </div>
    <div class="w-200 flex-none h-dvh">
      <TranslationAssistant/>
    </div>
  </div>
  <Toast />
</template>
]
