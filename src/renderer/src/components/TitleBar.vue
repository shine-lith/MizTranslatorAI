<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

defineProps({
  msg: String
})

const onDev = () => {
  window.api.onDevFunction()
}

// 打开文件
const onOpenFile = () => {
  window.api.onOpenFile()
}

// 保存文件
const onSaveFile = () => {
  window.api.onSaveFile()
}

// 打包
const onExportToMiz = () => {
  window.api.onExportToMiz()
}

// 最小化
const onWinMinimize = () => {
  window.api.onWinMinimize()
}

// 最大化/恢复
const onWinMaximize = () => {
  window.api.onWinMaximize()
}

// 关闭app
const onWindowClose = () => {
  window.api.onWinClose()
}

// 显示设置
const showPreference = () => {
  
}

const openedFile = ref('')
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
    <div id="apptitle" class="flex-auto m-6">{{ openedFile }}mizTranslator</div>
    <div id="winctrl" class="flex-none">
      <Button id="win_min" @click="onWinMinimize" variant="text" icon="fa-regular fa-window-minimize"></Button>
      <Button id="win_max" @click="onWinMaximize" variant="text" icon="fa-regular fa-square"></Button>
      <Button id="win_close" @click="onWindowClose" variant="text" icon="pi pi-times"></Button>
    </div>
  </div>
</template>

<style scoped>
.win_close{
  background-color: red;
}
</style>
