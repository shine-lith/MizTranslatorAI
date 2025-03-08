
<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button'

const value = ref(null);
</script>

<template>
    <div id="TranslationAssistant" class="h-full flex flex-col bg-gray-950 ">
        <div class="grow"></div>
        <div class="h-auto m-2 p-2 bg-gray-700 rounded-lg flex">
            <InputText class="flex-auto border-none" unstyled  placeholder="给AI模型发送消息" aria-multiline />
            <Button class="ml-4" aria-multiline rounded icon="pi pi-arrow-up" size="small" />
        </div>
    </div>
</template>
  