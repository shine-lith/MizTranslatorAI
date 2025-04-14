<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import TitleBar from './components/TitleBar.vue'
import { store, settings, miz_dictkey } from './store.js'

const toast = useToast()
const titleBarRef = ref()

// 处理文件加载
function onMizOpen(e, code, data) {
  if (code == 200) {
    // 识别那些事任务简报信息
    const dicts = ['descriptionText', 'descriptionRedTask', 'descriptionBlueTask']
    const mission_data = []
    // 过滤掉不需要的行，识别类型
    const datalist = data.data.filter((line) => {
      const r = line.key.match(/DictKey_(.*)_\d+/)
      const type = r ? r[1] : 'Text'
      line.showName = miz_dictkey[type]?.text || type
      // 提取简报信息
      if (dicts.includes(type)) {
        mission_data.push({ type: type, text: line.originText })
      }
      return miz_dictkey[type] ? miz_dictkey[type].keep : true
    })
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

// 打包miz
function onExportToMiz() {
  if (isMizLoaded()) {
    const data = {
      listdata: store.listdata,
      overwrite: settings.overwrite,
      backup: settings.backup,
      translate_compare: settings.translate_compare
    }
    window.api.onExportToMiz(JSON.stringify(data))
  }
}

// 响应点击通知
function clickNotifaction(action) {
  const method = action.method
  switch (method) {
    case 'openFolder':
      window.api.openFolder(action.args)
      break
    default:
  }
  toast.removeAllGroups()
}

// 显示通知
function onNotification(e, data) {
  toast.add({
    severity: 'secondary',
    summary: data.msg,
    detail: data.desc,
    action: data.action,
    life: 4000
  })
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
  <div class="h-screen overflow-hidden">
    <TitleBar
      ref="titleBarRef"
      @onOpenFile="onOpenFile"
      @onSaveFile="onSaveFile"
      @onExportToMiz="onExportToMiz"
    />
    <router-view v-slot="{ Component, route}">
      <Transition :name="route.meta.transition || 'slide'">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
  <Toast>
    <template #message="slotProps">
      <div class="flex flex-col flex-auto" @click="clickNotifaction(slotProps.message.action)">
        <div class="">{{ slotProps.message.summary }}</div>
        <div class="text-sm text-gray-500">{{ slotProps.message.detail }}</div>
      </div>
    </template>
  </Toast>
</template>

<style scoped>
/* 动画 */
.slide-in-enter-active,
.slide-in-leave-active{
  transition: all 1000ms;
}
.slide-in-enter-from {
  transform: translateY(-100%);
}

.slide-out-enter-active,
.slide-out-leave-active{
  transition: all 1000ms;
}
.slide-out-leave-to {
  transform: translateY(-100%);
}
</style>
