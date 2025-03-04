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
  window.api.openFile()
}

// 最小化
const onWindowMin = () => {
  this.$ipcRenderer.send('window-min')
}

// 最大化/恢复
const onWindowMax = () => {
  this.$ipcRenderer.send('window-max')
}

// 关闭app
const onWindowClose = () => {
  this.$ipcRenderer.send('window-close')
}
</script>

<template>
  <div id="titlebar" class="flex">
    <div id="menu" class="flex flex-none">
      <img class="m-6 h-6 w-6" src="../assets/app.svg" />
      <Button @click="onOpenFile" label="打开" icon="pi pi-file" variant="text" />
      <Button click="handleQ('request')" label="保存" icon="pi pi-save" variant="text" />
      <Button label="打包" icon="pi pi-export" variant="text" />
      <Button label="设置" icon="pi pi-cog" variant="text" />
      <Button @click="onDev" label="MAIN DEV" />
    </div>
    <div id="apptitle" class="flex-auto m-6">{{ openedFile }}mizTranslator</div>
    <div id="winctrl" class="flex-none">
      <Button id="win_min" @click="onWindowMin" icon="" />
      <Button id="win_max" @click="onWindowMax" icon="" />
      <Button id="win_close" @click="onWindowClose" icon="" />
    </div>
  </div>
</template>

<style scoped>

</style>
