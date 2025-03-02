<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

onMounted(() => {
  console.log('tableData')
  console.log('projectPath')
})

defineProps({
  tableData: Array,
  projectPath: String
})
</script>

<template>
  {{ projectPath }}
  <div class="card">
    <DataTable :value="tableData" resizableColumns columnResizeMode="fit">
      <Column field="key" header="key"></Column>
      <Column field="type" header="type"></Column>
      <Column field="originText" header="originText"></Column>
      <Column field="translateText" header="translateText"></Column>
    </DataTable>
  </div>
</template>
