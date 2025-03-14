<script setup>
import { ref } from 'vue'
import { store } from '../store.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'

const emit = defineEmits(['onLineSend'])

const selectedProduct = ref()
const loadingStates = ref({})

function onRowSelect(event) {
  console.log('onRowSelect')
}

function onRowUnselect(event) {
  console.log('onRowUnselect')
}

async function onLineSendButton(data, index){
  emit('onLineSend', data)
  if (loadingStates.value[data.key]) return
  loadingStates.value[data.key] = true
}

window.electron.ipcRenderer.on('onTranslateChunk', (e, data) => {
  if(data.done){
    loadingStates.value[data.key] = false
  }
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
    resizableColumns
  >
    <Column field="key" header="标识" sortable class="max-w-10 truncate"></Column>
    <Column field="type" header="类型" sortable class="max-w-15 truncate"></Column>
    <Column field="originText" header="原文" class="min-w-20 max-w-50 truncate"></Column>
    <Column field="translateText" header="译文" class="min-w-20 max-w-50 truncate"></Column>
    <Column class="!text-end">
      <template #body="{ data , index}">
        <!-- :icon 可以支持表达式 -->
        <Button :icon="!loadingStates[data.key]?'pi pi-angle-right':'pi pi-spinner pi-spin'" size="small" @click="onLineSendButton(data, index)" severity="secondary" rounded></Button>
      </template>
    </Column>
  </DataTable>
</template>
