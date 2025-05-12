<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TextList from './components/TextList.vue'
import TranslationAssistant from './components/TranslationAssistant.vue'
import { store, settings, miz_dictkey } from './store.js'
import Button from 'primevue/button'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'

const textlistRef = ref()
const chatRef = ref()
const projectPath = ref() // 项目路径
var llmTasks = []
const isQueueRunning = ref(false)
var interrupt = false

// 向LLM询问
function onLineSend(data) {
  addQueue(data)
}

// 自动翻译所有
function onTranslateAll() {
  if (store.projectPath) {
    store.listdata.forEach((data) => {
      data.translateText = ''
      addQueue(data)
      textlistRef.value.setLineLoading(data, true)
    })
  }
}

// 向LLM交互队列里添加任务
function addQueue(data) {
  llmTasks.push(data)
  interrupt = false
  if (!isQueueRunning.value) {
    run()
  }
}

// 执行队列
function run() {
  if (interrupt || llmTasks.length <= 0) {
    store.listdata.forEach((data) => {
      textlistRef.value.setLineLoading(data, false)
    })
    isQueueRunning.value = false
    interrupt = false
  } else {
    isQueueRunning.value = true
    const data = llmTasks[0]
    const send = async () => {
      // 向底层发送流式翻译请求
      var question_id = Date.now() + Math.random().toString(36).substring(2)
      chatRef.value.addUserLine(question_id, data.key, data.originText)
      chatRef.value.addAssistantLine(question_id, data.key)

      if (data.method === 'chat') {
        // 向llm提问
        window.api.llmChat({
          api: 'ollama',
          host: settings.value.ollama_host,
          model: settings.value.ollama_model,
          temperature: settings.value.ollama_temperature,
          context: getHistoryMessages(),
          question_id: question_id,
          key: data.key,
          originText: data.originText,
          keep_alive: '3m'
        })
      } else {
        // llm翻译
        window.api.llmGenerate({
          api: 'ollama',
          host: settings.value.ollama_host,
          model: settings.value.ollama_model,
          prompt: data.originText,
          system: settings.value.translate_prompt,
          stream: true,
          temperature: settings.value.ollama_temperature,
          question_id: question_id,
          key: data.key,
          originText: data.originText,
          keep_alive: '3m'
        })
      }
    }
    send()
  }
}

// 获取chat模式下的历史消息
function getHistoryMessages() {
  const messages = []
  // 构建消息体
  const m = (role, content) => {
    return {
      role: role,
      content: content
    }
  }
  // chat使用的prompt，并将miz中的简报信息提供给llm
  var chatSystemPrompt = settings.value.chat_prompt
  var miz_data = ''
  store.mission_data.forEach((item) => {
    if (item.type == 'descriptionText') {
      miz_data += '# 当前形势\r\n'
    }
    if (item.type == 'descriptionRedTask' || item.type == 'descriptionBlueTask') {
      miz_data += '# 任务说明\r\n'
    }
    miz_data += item.text
  })
  chatSystemPrompt = chatSystemPrompt.replace(/{miz_data}/g, miz_data)
  messages.push(m('system', chatSystemPrompt))

  // 消息中添加上下文
  const history = chatRef.value.getMessageHistory()
  if (history.length > 0) {
    history.slice(0, settings.value.ollama_context_limit).forEach((m) => {
      messages.push(m)
    })
  }
  return messages
}

// 停止翻译
function onTranslateStop() {
  interrupt = true
  llmTasks = []
}

// 监听翻译的流
function onTranslateChunk(e, data) {
  // 如果是流传输完毕则启动下一个任务
  if (data.done) {
    llmTasks.shift()
    run()
  }
}

onMounted(() => {
  window.electron.ipcRenderer.on('onTranslateChunk', onTranslateChunk)
})

onUnmounted(() => {
  window.electron.ipcRenderer.removeAllListeners('onTranslateChunk')
})
</script>

<template>
  <div class="absolute w-full h-full pt-14 flex overflow-hidden">
    <Splitter
      class="flex-1 flex overflow-hidden"
      gutterSize="1"
      stateKey="main_side_splitter"
      stateStorage="local"
      layout="vertical"
    >
      <SplitterPanel class="flex-1 overflow-y-auto">
        <TextList ref="textlistRef" @onLineSend="onLineSend" />
      </SplitterPanel>
      <SplitterPanel class="flex-1 flex flex-col">
        <TranslationAssistant
          ref="chatRef"
          :isQueueRunning="isQueueRunning"
          @onLineSend="onLineSend"
          @onTranslateAll="onTranslateAll"
          @onTranslateStop="onTranslateStop"
        />
      </SplitterPanel>
    </Splitter>
  </div>
</template>
