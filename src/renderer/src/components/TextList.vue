<script setup>
import { store } from '../store.js'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

// defineProps({
//   tableData: Array,
// })

</script>

<template>
  <!-- {{ store.projectPath }} -->
  <div class="card">
    <DataTable :value="store.listdata" stripedRows columnResizeMode="fit">
      <Column field="key" header="key"></Column>
      <Column field="type" header="type"></Column>
      <Column field="originText" header="originText"></Column>
      <Column field="translateText" header="translateText"></Column>
    </DataTable>
  </div>
</template>
