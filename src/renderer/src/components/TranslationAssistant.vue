<script setup>
import { ref,nextTick } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ChatBubble from './ChatBubble.vue'

defineExpose({
  addUserLine,
  addAssistantLine,
  scrollToBottom,
})

defineProps({
  isQueueRunning: Boolean
})

const emit = defineEmits(['onLineSend','onTranslateAll','onTranslateStop'])

const chatInput = ref(null)
const chatLoading = ref(false)
const componentList = ref([])
const counter = ref(0)
const componentContainer = ref(null)

// 发送用户输入的问题到LLM询问队列
function onChatSend(){
  if(chatLoading.value){
    return
  }
  if(!chatInput.value){
    return
  }
  const data = {
    key: '',
    originText: chatInput.value
  }
  chatInput.value = ''
  chatLoading.value = true
  emit('onLineSend', data)
}

function onTranslateAll(){
  emit('onTranslateAll')
}

function onTranslateStop(){
  emit('onTranslateStop')
}

// 添加用户输入行
async function addUserLine(question_id, dictkey, text){
  componentList.value.push({
    id: ++counter.value,
    name: 'ChatBubble', // 必须已注册
    props: {
      type: 'user',
      message: text,
      dictkey: dictkey,
      question_id: question_id 
    }
  })
  await nextTick() // 确保DOM先执行更新，然后设置滚动条
  scrollToBottom(true)
}

// 添加LLM的反馈行
async function addAssistantLine(question_id, dictkey) {
  componentList.value.push({
    id: ++counter.value,
    name: 'ChatBubble', // 必须已注册
    props: {
      dictkey: dictkey,
      type: 'assistant',
      message: '',
      question_id: question_id,
      loading: true,
    }
  })
  await nextTick() // 确保DOM先执行更新，然后设置滚动条
  scrollToBottom(true)
}

function removeComponent(id) {
  componentList.value = componentList.value.filter((comp) => comp.id !== id)
}

// 滚动到最底部
function scrollToBottom(force = false) {
  const el = componentContainer.value;
  if (force) {
    el.scrollTop = el.scrollHeight;
    return
  }
  const threshold = 20 // 允许的误差范围
  // 判断是否接近底部
  const isNearBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= threshold;
  if (isNearBottom) {
    el.scrollTop = el.scrollHeight;
  }
};

// 监听翻译的流
window.electron.ipcRenderer.on('onTranslateChunk', (e, data) => {
  var com = componentList.value.find((comp)=> comp.props.type == 'assistant' && comp.props.question_id == data.question_id)
  if (com) {
    com.props.message += data.chunk
    if(data.done){
      com.props.loading = false
    }
    scrollToBottom()
  }
  if(data.done){
    chatLoading.value = false
  }
})

</script>

<template>
  <!-- 顶部导航 -->
  <div class="p-2 top-0 w-full backdrop-blur-sm border-b border-gray-700">
    <div class="flex items-center">
      <div class="flex-1 flex gap-2">
        <h1 class="font-semibold text-sm">LLM</h1>
        <p class="text-sm">Ollama - DeepSeek-r1:32b</p>
      </div>
      <Button v-show="!isQueueRunning" class="h-4" @click="onTranslateAll" label="翻译所有" icon="pi pi-bolt" variant="text" />
      <Button v-show="isQueueRunning" class="h-4" @click="onTranslateStop" label="停止" icon="pi pi-stop-circle" variant="text" />
    </div>
  </div>
  <div ref="componentContainer" class="h-full overflow-y-auto pl-0 pr-3 gap-2">
    <component
      v-for="comp in componentList"
      :is="comp.name"
      :key="comp.id"
      v-bind="comp.props"
      @remove="removeComponent(comp.id)"
    />
  </div>
  <div class="p-1 w-full backdrop-blur-sm border-t border-gray-700 flex gap-2">
    <InputText v-model="chatInput" class="border-none flex-1" placeholder="给LLM发送消息" aria-multiline />
    <Button
      @click="onChatSend"
      class="ml-4"
      aria-multiline
      rounded
      :icon="chatLoading?'pi pi-spin pi-spinner':'pi pi-arrow-up'"
      size="small"
      :disabled="chatLoading"
    />
  </div>
</template>
