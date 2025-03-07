<script setup>
import { ref, onMounted, watch } from 'vue'
import { store } from '../store.js'
import Button from 'primevue/button'

defineProps({
  msg: String
})

defineExpose({
  setTitle
})

const emit = defineEmits(['onOpenFile', 'onSaveFile'])

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
  window.api.onExportToMiz()
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
function showPreference() {}
</script>

<template>
  <div id="titlebar" class="flex">
    <div id="menu" class="flex flex-none">
      <img class="m-6 h-6 w-6" src="../assets/app.svg" />
      <Button @click="onOpenFile" label="打开" icon="pi pi-file" variant="text" />
      <Button @click="onSaveFile" label="保存" icon="pi pi-save" variant="text" />
      <Button @click="onExportToMiz" label="打包" icon="pi pi-export" variant="text" />
      <Button @click="showPreference" label="设置" icon="pi pi-cog" variant="text" />
      <Button @click="onDev" label="MAIN DEV" />
    </div>
    <div id="apptitle" class="flex-auto m-6 truncate">{{ titleText }}</div>
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
#win_close:hover {
  background-color: red;
}
</style>
