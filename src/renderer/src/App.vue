<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import TitleBar from './components/TitleBar.vue'
import { store, miz_dictkey } from './store.js'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const titleBarRef = ref()

// 处理文件加载
function onMizOpen(e, code, data) {
  if (code == 200) {
    // 识别那些事任务简报信息
    const dicts = ['descriptionText','descriptionRedTask','descriptionBlueTask'];
    const mission_data = []
    // 过滤掉不需要的行，识别类型
    const datalist = data.data.filter((line) => {
        const r = line.key.match(/DictKey_(.*)_\d+/)
        const type = r ? r[1] : 'Text'
        line.showName = miz_dictkey[type]?.text || type
        // 提取简报信息
        if (dicts.includes(type)) {
          mission_data.push({type: type, text: line.originText})
        }
        return miz_dictkey[type] ? miz_dictkey[type].keep : true
      }
    )
    // 过滤掉不需要的行，识别类型  
    store.mizFile = data.mizFile
    store.projectPath = data.projectPath
    store.listdata = datalist
    store.mission_data = mission_data
    titleBarRef.value.setTitle(`mizTranslator - ${data.mizFile}`)
  }
}

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

// 显示通知
function onNotification(e, message, data){
  toast.add({ severity: 'secondary', summary: message.msg, detail: message.desc, life: 3000 })
}

onMounted(() => {
  window.electron.ipcRenderer.on('onMizOpen', onMizOpen)
  window.electron.ipcRenderer.on('onNotification', onNotification)
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('onMizOpen')
  window.electron.ipcRenderer.removeAllListeners('onNotification')
})
</script>

<template>
  <div class="h-screen flex flex-col z-999">
    <TitleBar ref="titleBarRef" @onOpenFile="onOpenFile" @onSaveFile="onSaveFile" />
    <RouterView />
  </div>
  <Toast />
</template>
