<script setup>
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ChatBubble from './ChatBubble.vue'

defineExpose({
  addUserLine
})

const value = ref(null)
const componentList = ref([])
const counter = ref(0)

function addUserLine(text){
  componentList.value.push({
    id: ++counter.value,
    name: 'ChatBubble', // 必须已注册
    props: {
      type: 'user',
      message: text
    }
  })
}

function sendMsg() {
  componentList.value.push({
    id: ++counter.value,
    name: 'ChatBubble', // 必须已注册
    props: {
      type: 'user'
    }
  })

  componentList.value.push({
    id: ++counter.value,
    name: 'ChatBubble', // 必须已注册
    props: {
      type: 'receive'
    }
  })
}

function removeComponent(id) {
  componentList.value = componentList.value.filter((comp) => comp.id !== id)
}
</script>

<template>
  <!-- 顶部导航 -->
  <div class="p-2 top-0 w-full backdrop-blur-sm border-b border-gray-700">
    <div class="flex items-center">
      <div class="flex-1 flex gap-2">
        <h1 class="font-semibold text-sm">LLM交互</h1>
        <p class="text-sm">Ollama - DeepSeek-r1:32b</p>
      </div>
      <div class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
    </div>
  </div>

  <div class="h-full overflow-y-auto pl-0 pr-0 gap-2">
    <component
      v-for="comp in componentList"
      :is="comp.name"
      :key="comp.id"
      v-bind="comp.props"
      @remove="removeComponent(comp.id)"
    />
  </div>
  <div class="p-1 w-full backdrop-blur-sm border-t border-gray-700 flex gap-2">
    <InputText class="border-none flex-1" placeholder="给LLM发送消息" aria-multiline />
    <Button
      @click="sendMsg"
      class="ml-4"
      aria-multiline
      rounded
      icon="pi pi-arrow-up"
      size="small"
    />
  </div>
</template>
