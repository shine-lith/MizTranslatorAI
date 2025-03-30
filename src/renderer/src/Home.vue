<script setup>
import { ref } from 'vue'
import TextList from './components/TextList.vue'
import TranslationAssistant from './components/TranslationAssistant.vue'
import { store, settings } from './store.js'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'

const toast = useToast()
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
  //todo add all store.data to list
  store.listdata.forEach(data => {
    addQueue(data)
    textlistRef.value.setLineLoading(data, true)
  })
}


// 向LLM交互队列里添加任务
function addQueue(data){
  llmTasks.push(data)
  interrupt = false
  if(!isQueueRunning.value){
    run()
  }
}

// 执行队列
function run(){
  if(interrupt || llmTasks.length <= 0) {
    store.listdata.forEach(data => {
      textlistRef.value.setLineLoading(data, false)
    })
    isQueueRunning.value = false
    interrupt = false
  } else {
    isQueueRunning.value = true
    const data = llmTasks[0]
    const send = async ()=> {
      // 向底层发送流式翻译请求
      var question_id = Date.now() + Math.random().toString(36).substring(2);
      chatRef.value.addUserLine(question_id, data.key, data.originText)
      chatRef.value.addAssistantLine(question_id, data.key)
      
      window.api.translateChunk({
        api: "ollama",
        host: settings.value.ollama_host,
        model: settings.value.ollama_model,
        temperature: settings.value.ollama_temperature,
        context: getHistoryMessages(),
        question_id: question_id,
        key: data.key,
        originText: data.originText,
        keep_alive: '3m'
      })
    }
    send()
  }
}

// 构建上下文
function getHistoryMessages() {
  const messages = []
  const m = (role, content)=>{
    return {
      role: role,
      content: content
    }
  }
  messages.push(m('system', settings.value.system_prompt))
  const history = chatRef.value.getMessageHistory()
  if(history.length > 0){
    history.forEach((m) => { messages.push(m) })
  }
  return messages;
}

// 停止翻译
function onTranslateStop(){
  interrupt = true
  llmTasks = []
}

// 监听翻译的流
window.electron.ipcRenderer.on('onTranslateChunk', (e, data) => {
  // 如果是流传输完毕则启动下一个任务
  if(data.done){
    llmTasks.shift()
    run()
  }
})

// 显示通知
window.electron.ipcRenderer.on('onNotification', (e, message, data) => {
  toast.add({ severity: 'secondary', summary: message.msg, detail: message.desc, life: 3000 })
})

</script>

<template>
    <div class="flex-1 flex overflow-hidden">
      <Splitter
        class="flex-1 flex overflow-hidden"
        gutterSize=1
        stateKey="main_side_splitter"
        stateStorage="local"
        layout="vertical"
      >
        <SplitterPanel class="flex-1 overflow-y-auto">
          <TextList ref="textlistRef" @onLineSend="onLineSend"/>
        </SplitterPanel>
        <SplitterPanel class="flex-1 flex flex-col">
          <TranslationAssistant ref="chatRef" :isQueueRunning="isQueueRunning" @onLineSend="onLineSend" @onTranslateAll="onTranslateAll" @onTranslateStop="onTranslateStop"/>
        </SplitterPanel>
      </Splitter>
    </div>
    <Toast />
</template>