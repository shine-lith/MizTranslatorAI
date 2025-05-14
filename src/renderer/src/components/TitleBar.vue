<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { store } from '../store.js'
import Button from 'primevue/button'

const router = useRouter()

defineProps({
  msg: String
})

defineExpose({
  setTitle
})

const emit = defineEmits(['onOpenFile', 'onSaveFile', 'onExportToMiz'])

const titleText = ref('mizTranslator')

// watch (
//   () => store.mizFile,
//   (newVal, oldVal) => {
//     titleText.value = `mizTranslator - ${newVal}`
//   }
// )

function setTitle(title) {
  titleText.value = title
}

function onDev() {
  window.api.onDevFunction()
}

// 打开文件
function onOpenFile() {
  emit('onOpenFile')
}

// 保存文件
function onSaveFile() {
  emit('onSaveFile')
}

// 打包
function onExportToMiz() {
  emit('onExportToMiz')
}

// 最小化
function onWinMinimize() {
  window.api.onWinMinimize()
}

// 最大化/恢复
function onWinMaximize() {
  window.api.onWinMaximize()
}

// 关闭app
function onWindowClose() {
  window.api.onWinClose()
}

// 显示设置
function showPreference() {
  router.push('/preference')
}
</script>

<template>
  <div id="titlebar" class="h-14 w-full fixed flex z-999">
    <div id="menu" class="flex flex-none">
      <img class="m-4" src="../assets/app.png" />
      <Button @click="onOpenFile" size="small" label="打开" icon="pi pi-file" variant="text" />
      <Button @click="onSaveFile" size="small" label="保存" icon="pi pi-save" variant="text" />
      <Button @click="onExportToMiz" size="small" label="打包" icon="pi pi-box" variant="text" />
      <Button @click="showPreference" size="small" label="设置" icon="pi pi-cog" variant="text" />
    </div>
    <div id="apptitle" class="flex-auto flex items-center truncate pl-2">{{ titleText }}</div>
    <div id="winctrl" class="flex-none">
      <Button id="win_min" @click="onWinMinimize" variant="text" icon="pi pi-minus"></Button>
      <Button
        id="win_max"
        @click="onWinMaximize"
        variant="text"
        icon="fa-regular fa-square"
      ></Button>
      <Button id="win_close" @click="onWindowClose" variant="text" icon="pi pi-times"></Button>
    </div>
  </div>
</template>

<style scoped>
#titlebar {
  background-color: #1e1e1e;
}
#apptitle {
  -webkit-app-region: drag;
  cursor: default;
  user-select: none;
  font-size: 0.9rem;
}
#win_close:hover {
  background-color: red;
}
</style>
