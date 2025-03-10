<script setup>
import { ref } from 'vue'
import { store } from '../store.js'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const selectedProduct = ref();

function onRowSelect(event){
console.log('onRowSelect')
}

function onRowUnselect(event){
  console.log('onRowUnselect')
}
</script>

<template>
  <DataTable class="h-full" :value="store.listdata" @rowSelect="onRowSelect" @rowUnselect="onRowUnselect" dataKey="key" v-model:selection="selectedProduct" selectionMode="single" size="small" stripedRows resizableColumns>
    <Column field="key" header="标识" sortable class="max-w-10 truncate"></Column>
    <Column field="type" header="类型" sortable class="max-w-15 truncate"></Column>
    <Column field="originText" header="原文" class="min-w-20 max-w-50 truncate"></Column>
    <Column field="translateText" header="译文" class="min-w-20 max-w-50 truncate"></Column>
  </DataTable>
</template>
