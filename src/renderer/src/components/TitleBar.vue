<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

defineProps({
  msg: String
})

// 最小化
const onMinimize = () => {
  window.api.onMinimize()
}

// 打开文件
const onOpenFile = async () => {
  const result = await window.electronAPI.openFile()
  console.log(result)
}

const count = ref(0)
</script>

<template>
  <div id="titlebar" class="flex">
    <img class="m-5 h-6 w-6" src="../assets/app.svg" />
    <Button @click="onOpenFile" label="打开" icon="pi pi-file" variant="text" />
    <Button click="handleQ('request')" label="保存" icon="pi pi-save" variant="text" />
    <Button label="打包" icon="pi pi-export" variant="text" />
    <Button label="设置" icon="pi pi-cog" variant="text" />
    <Button @click="onMinimize" label="最小化" />
    <Button @click="" label="全屏" />
    <Button @click="" label="退出" />
    <div class="m-5">MizTran</div>
  </div>
</template>

<style scoped></style>
