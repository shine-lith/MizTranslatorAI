<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { store } from '../store.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

defineExpose({
  setLineLoading
})
const emit = defineEmits(['onLineSend'])

const selectedProduct = ref()
// 每一行的加载状态
const loadingStates = ref([])

function onRowSelect(event) {}

function onRowUnselect(event) {}

// 发送当前行到LLM询问队列
async function onLineSendButton(data, index) {
  var line = store.listdata.find((d) => d.key == data.key)
  // 清空翻译列
  line.translateText = ''
  // 启动loading动画
  if (loadingStates.value[data.key]) return
  setLineLoading(data, true)
  emit('onLineSend', data)
}

// 监听翻译的流
function onTranslateChunk(e, data) {
  var line = store.listdata.find((d) => d.key == data.key)
  if (line) {
    // 更新内容
    line.translateText += data.chunk
    if (data.done) {
      // 忽略思考内容
      line.translateText = removeThinkTags(line.translateText)
      line.translateText = line.translateText.trim()
      //消除loading动画
      setLineLoading(data, false)
    }
  }
}

// 设置这一行的loading 状态
function setLineLoading(data, state) {
  loadingStates.value[data.key] = state
}

// 设置所有行loading 状态为false
function setLineLoadingAllDone() {
  store.listdata.forEach((data) => {
    loadingStates.value[data.key] = false
  })
}

// 过滤思考标签中的内容
function removeThinkTags(str) {
  // 匹配 <think> 标签及其内容（包括多行情况）
  const regex = /<think\b[^>]*>[\s\S]*?<\/think>/g
  return str.replace(regex, '')
}

onMounted(() => {
  window.electron.ipcRenderer.on('onTranslateChunk', onTranslateChunk)
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('onTranslateChunk')
})
</script>

<template>
  <DataTable
    class="h-full"
    :value="store.listdata"
    @rowSelect="onRowSelect"
    @rowUnselect="onRowUnselect"
    v-model:selection="selectedProduct"
    selectionMode="single"
    size="small"
    stripedRows
    scrollable
    scrollHeight="flex"
    sortField="showName"
    :sortOrder="1"
  >
    <Column
      field="showName"
      header="类型"
      sortable
      class="w-[80px] content-stretch truncate"
    ></Column>
    <Column field="no" header="标识" sortable class="w-[40px] content-stretch truncate"></Column>
    <Column field="originText" header="原文" class="min-w-20 max-w-20 content-stretch"></Column>
    <Column field="translateText" header="译文" class="min-w-20 max-w-20 content-stretch"></Column>
    <Column class="w-[40px] !text-end content-stretch">
      <template #body="{ data, index }">
        <!-- :icon 可以支持表达式 -->
        <Button
          v-show="data.originText !== ''"
          :icon="!loadingStates[data.key] ? 'pi pi-angle-right' : 'pi pi-spinner pi-spin'"
          :disabled="loadingStates[data.key]"
          size="small"
          @click="onLineSendButton(data, index)"
          severity="secondary"
          rounded
        ></Button>
      </template>
    </Column>
  </DataTable>
</template>
