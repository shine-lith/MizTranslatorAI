
<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';

const value = ref(null);
</script>

<template>
    <div id="TranslationAssistant" class="grid">
        <div class="h-full"></div>
        <div class="content-end">
            <InputText type="text" v-model="value" />
        </div>
    </div>
</template>
  