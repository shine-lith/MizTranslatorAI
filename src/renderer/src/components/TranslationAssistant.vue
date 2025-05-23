<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { store, settings } from '../store.js'

import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ChatBubble from './ChatBubble.vue'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'

defineExpose({
  addUserLine,
  addAssistantLine,
  getMessageHistory,
  scrollToBottom,
  clearHistory
})

const props = defineProps({
  isQueueRunning: Boolean
})

const emit = defineEmits(['onLineSend', 'onTranslateAll', 'onTranslateStop'])

const chatInput = ref(null)
const chatLoading = ref(false)
const messageList = []
const componentList = ref([])
const counter = ref(0)
const componentContainer = ref(null)
const dialog_editSystemPrompt_show = ref(false)
const dialog_editSystemPrompt_chat = ref(null)
const dialog_editSystemPrompt_translate = ref(null)

// 发送用户输入的问题到LLM询问队列
function onChatSend() {
  if (!store.projectPath) {
    return
  }
  if (chatLoading.value) {
    return
  }
  if (!chatInput.value) {
    return
  }
  const data = {
    method: 'chat',
    key: '',
    originText: chatInput.value
  }
  chatInput.value = ''
  chatLoading.value = true
  emit('onLineSend', data)
}

function onTranslateAll() {
  emit('onTranslateAll')
}

function onTranslateStop() {
  emit('onTranslateStop')
}

// 返回历史消息
function getMessageHistory() {
  return messageList
}

// 添加用户输入行
async function addUserLine(question_id, dictkey, text) {
  if(componentList.value.length >= 100){
    componentList.value.shift()
  }
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
  if(componentList.value.length >= 100){
    componentList.value.shift()
  }
  componentList.value.push({
    id: ++counter.value,
    name: 'ChatBubble', // 必须已注册
    props: {
      dictkey: dictkey,
      type: 'assistant',
      message: '',
      question_id: question_id,
      loading: true
    }
  })
  await nextTick() // 确保DOM先执行更新，然后设置滚动条
  scrollToBottom(true)
}

function clearHistory() {
  componentList.value = []
  messageList.length = 0
}

function removeComponent(id) {
  componentList.value = componentList.value.filter((comp) => comp.id !== id)
}

// 滚动到最底部
function scrollToBottom(force = false) {
  const el = componentContainer.value
  if (force) {
    el.scrollTop = el.scrollHeight
    return
  }
  const threshold = 20 // 允许的误差范围
  // 判断是否接近底部
  const isNearBottom = el.scrollHeight - el.clientHeight - el.scrollTop <= threshold
  if (isNearBottom) {
    el.scrollTop = el.scrollHeight
  }
}

// 显示系统提示此编辑框
function dialogEditSystemPromptShow() {
  dialog_editSystemPrompt_show.value = true
  dialog_editSystemPrompt_translate.value = settings.value.translate_prompt
  dialog_editSystemPrompt_chat.value = settings.value.chat_prompt
}

// 保存系统提示此编辑框
function dialogEditSystemPromptSave() {
  dialog_editSystemPrompt_show.value = false
  settings.value.translate_prompt = dialog_editSystemPrompt_translate.value
  settings.value.chat_prompt = dialog_editSystemPrompt_chat.value
}

// 监听翻译的流
function onTranslateChunk(e, data) {
  var assi = componentList.value.find(
    (comp) => comp.props.type == 'assistant' && comp.props.question_id == data.question_id
  )
  var user = componentList.value.find(
    (comp) => comp.props.type == 'user' && comp.props.question_id == data.question_id
  )

  if (assi) {
    assi.props.message += data.chunk
    if (data.done) {
      assi.props.loading = false
    }
    scrollToBottom()
  }

  if (data.done) {
    chatLoading.value = false
    if (user) {
      // 将用户问题保存到历史消息列表
      messageList.push({
        type: 'user',
        message: user.props.message
      })
    }
    if (assi) {
      // 将LLM回答保存到历史消息列表
      messageList.push({
        type: 'assistant',
        message: assi.props.message
      })
    }
  }
}

function onMizOpen(e, code, data) {
  clearHistory();
}

onMounted(() => {
  window.electron.ipcRenderer.on('onMizOpen', onMizOpen)
  window.electron.ipcRenderer.on('onTranslateChunk', onTranslateChunk)
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('onMizOpen')
  window.electron.ipcRenderer.removeAllListeners('onTranslateChunk')
})
</script>

<template>
  <!-- 顶部导航 -->
  <div class="top-0 w-full backdrop-blur-sm border-b border-gray-700">
    <div class="h-8 flex items-center">
      <div class="p-2 flex-1 flex gap-2">
        <h1 class="font-semibold text-sm">LLM</h1>
        <p class="text-sm flex gap-2">
          <span v-show="settings.ollama_host !== ''">
            <span>Ollama</span>
            <span v-show="settings.ollama_model !== null"> - {{ settings.ollama_model }}</span>
          </span>
        </p>
      </div>
      <Button
        v-show="!isQueueRunning"
        @click="onTranslateAll"
        label="翻译所有"
        variant="text"
        icon="pi pi-play"
        size="small"
      />
      <Button
        v-show="isQueueRunning"
        @click="onTranslateStop"
        label="停止"
        variant="text"
        size="small"
        icon="pi pi-stop"
      />
      <Button
        @click="dialogEditSystemPromptShow"
        label="提示词设置"
        icon="pi pi-wrench"
        variant="text"
        size="small"
      />
      <Button
        @click="clearHistory"
        label="清空"
        icon="pi pi-delete-left"
        variant="text"
        size="small"
      />
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
    <InputText
      v-model="chatInput"
      class="border-none flex-1"
      placeholder="针对任务简报信息进行提问"
      aria-multiline
    />
    <Button
      @click="onChatSend"
      class="m-1"
      aria-multiline
      rounded
      :icon="chatLoading ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-up'"
      size="small"
      :disabled="chatLoading"
    ></Button>
  </div>

  <Dialog
    v-model:visible="dialog_editSystemPrompt_show"
    modal
    header="Header"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <div class="inline-flex items-center justify-center gap-2">
        <span class="font-bold whitespace-nowrap">提示词设置</span>
      </div>
    </template>
    <div>
      <label for="chat_prompt">问答提示词</label>
      <Textarea
        id="chat_prompt"
        class="w-[100%]"
        v-model="dialog_editSystemPrompt_chat"
        autoResize
        variant="filled"
      />
    </div>
    <div>
      <label for="translate_prompt">翻译提示词</label>
      <Textarea
        id="translate_prompt"
        class="w-[100%]"
        v-model="dialog_editSystemPrompt_translate"
        autoResize
        variant="filled"
      />
    </div>
    <template #footer>
      <Button
        label="确定"
        outlined
        severity="secondary"
        @click="dialogEditSystemPromptSave"
        autofocus
      />
    </template>
  </Dialog>
</template>
