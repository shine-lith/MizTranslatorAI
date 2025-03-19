<script setup>
import { ref } from 'vue'
import TextList from './components/TextList.vue'
import TitleBar from './components/TitleBar.vue'
import TranslationAssistant from './components/TranslationAssistant.vue'

import { store } from './store.js'

import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'

const toast = useToast()
//const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
const titleBarRef = ref()
const textlistRef = ref()
const chatRef = ref()
const projectPath = ref() // 项目路径
const llmTasks = []
var isRunning = false

window.electron.ipcRenderer.on('onNotification', (e, message, data) => {
  toast.add({ severity: 'secondary', summary: message.msg, detail: message.desc, life: 3000 })
})

// 处理文件加载
window.electron.ipcRenderer.on('onMizOpen', (e, code, data) => {
  if (code == 200) {
    store.mizFile = data.mizFile
    store.projectPath = data.projectPath
    store.listdata = data.data
    titleBarRef.value.setTitle(`mizTranslator - ${data.mizFile}`)
  }
})

function isMizLoaded() {
  return store.mizFile && store.projectPath ? true : false
}

function onOpenFile() {
  window.api.onOpenFile()
}

// 保存翻译工程
function onSaveFile() {
  if (isMizLoaded()) {
    window.api.onSaveFile(JSON.stringify(store.listdata))
  }
}

// 向LLM询问
function onLineSend(data) {
  addQueue(data)
}
// 自动翻译所有
function onTranslateAll() {
  //todo add all store.data to list
}

// 向LLM交互队列里添加任务
function addQueue(data){
  llmTasks.push(data)
  if(!isRunning){
    run()
  }
}

// 执行队列
function run(){
  isRunning = true
  const data = llmTasks[0]
  const send = async ()=> {
    // 向底层发送流式翻译请求
    var question_id = Date.now() + Math.random().toString(36).substring(2);
    chatRef.value.addUserLine(question_id, data.key, data.originText)
    chatRef.value.addAssistantLine(question_id, data.key)
    window.api.translateChunk({
      question_id: question_id,
      key: data.key,
      originText: data.originText
    })
  }
  send()
}

// 监听翻译的流
window.electron.ipcRenderer.on('onTranslateChunk', (e, data) => {
  // 如果是流传输完毕则启动下一个任务
  if(data.done){
    llmTasks.shift()
    if(llmTasks.length > 0 ){
      run()
    }else{
      isRunning = false
    }
  }
})
</script>

<template>
  <!-- <div class="z-0 absolute rounded-full bg-radial right-0 bottom-0 h-80 w-80 bg-linear-to-r from-cyan-500 to-blue-500 blur-[200px]"></div> -->
  <div class="h-screen flex flex-col z-999">
    <TitleBar ref="titleBarRef" @onOpenFile="onOpenFile" @onSaveFile="onSaveFile" />
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
          <TranslationAssistant ref="chatRef" @onLineSend="onLineSend" onTranslateAll="onTranslateAll"/>
        </SplitterPanel>
      </Splitter>
    </div>
    <Toast />
  </div>
</template>
