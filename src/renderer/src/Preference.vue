<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { settings } from './store.js'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import IftaLabel from 'primevue/IftaLabel'
import Select from 'primevue/select'
import Slider from 'primevue/slider'

const router = useRouter()
const ollamaModels = ref()

function back() {
  router.back()
}

// 刷新Ollama模型列表
async function onOllamaList() {
  // 清空列表与持久化
  ollamaModels.value = null
  settings.value.ollama_model_list = null
  // 请求列表
  const result = await window.api.onOllamaList({
    host: settings.value.ollama_host
  })
  if (result) {
    let models = result.models.map((e) => e.name)
    ollamaModels.value = models
    settings.value.ollama_model_list = JSON.stringify(models)
  }
}

onMounted(() => {
  if (settings.value.ollama_model_list)
    ollamaModels.value = JSON.parse(settings.value.ollama_model_list)
})
</script>
<template>
  <div id="preference" class="flex-col">
    <div class="flex-none">
      <Button @click="back" label="返回"></Button>
    </div>

    <div class="flex flex-1">
      <div class="p-2 w-60">
        <ol>
          <li class="p-5 hover:bg-sky-700">LLM 翻译设置</li>
          <li class="p-5 hover:bg-sky-700">Ollama</li>
        </ol>
      </div>
      <div class="flex-1 flex flex-col gap-2 pr-10">
        <h2 id="setting">提示词设置</h2>
        <p class="text-sm text-gray-500">
          该示词会在问答和翻译时自动添加到问题前面，以便让LLM模型更好地理解问题
        </p>
        <label for="chat_prompt">问答提示词</label>
        <Textarea id="chat_prompt" v-model="settings.chat_prompt" autoResize variant="filled" />
        <p class="text-sm text-gray-500">{miz_data} 用来代表任务简报信息，是问答题提示词的关键内容，请勿删除</p>

        <label for="translate_prompt">翻译提示词</label>
        <Textarea id="translate_prompt" v-model="settings.translate_prompt" autoResize variant="filled" />
        <h2>Ollama</h2>
        <label for="ollama_host">API地址</label>
        <InputText
          id="ollama_host"
          class="flex-1"
          v-model="settings.ollama_host"
          variant="filled"
          placeholder="http://127.0.0.1:11434"
        />

        <label for="ollama_model">模型</label>
        <div class="flex gap-5">
          <Select
            id="ollama_model"
            v-model="settings.ollama_model"
            :options="ollamaModels"
            placeholder="选择一个模型"
            checkmark
            :highlightOnSelect="false"
            class="w-full md:w-56"
            emptyMessage="无"
          />
          <Button
            :disabled="settings.ollama_host == ''"
            @click="onOllamaList"
            label="刷新模型列表"
            severity="secondary"
          />
        </div>

        <label for="ollama_context_limit">最大上下文长度</label>
        <div class="flex gap-5">
          <Slider v-model="settings.ollama_context_limit" min="0" max="30" class="w-56 my-5" />
          <InputText v-model.number="settings.ollama_context_limit" class="w-12" />
        </div>

        <label for="ollama_model">温度</label>
        <div class="flex gap-5">
          <Slider
            v-model="settings.ollama_temperature"
            min="0"
            max="1"
            step="0.01"
            class="w-56 my-5"
          />
          <InputText v-model.number="settings.ollama_temperature" class="w-12" />
        </div>
      </div>
    </div>
  </div>
</template>
