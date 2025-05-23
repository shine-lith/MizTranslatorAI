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
import Checkbox from 'primevue/checkbox'

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
  <div id="preference" class="absolute w-full h-full pt-14 z-100">
    <div class="h-12 bg-gray-700 fixed w-full flex items-center">
      <div class="flex items-center gap-4">
        <Button
          class="h-12"
          @click="back"
          size="small"
          icon="pi pi-arrow-left"
          label="返回"
          variant="text"
        ></Button>
        <h1>设置</h1>
      </div>
    </div>

    <div class="pt-12 h-full flex">
      <div class="text-sm flex flex-col w-60 overflow-hidden">
        <ol>
          <a href="#export"><li class="p-5">打包</li></a>
          <a href="#prompt"><li class="p-5">LLM翻译设置</li></a>
          <a href="#ollama"><li class="p-5">Ollama</li></a>
          <a href="#about"><li class="p-5">关于</li></a>
        </ol>
      </div>

      <div class="text-sm pr-4 pb-20 flex-1 overflow-y-auto scroll-smooth">
        <h1 class="text-xl py-5" id="export" name="export">打包</h1>

        <div class="flex flex-col mb-4">
          <div class="flex mb-1 gap-2">
            <Checkbox v-model="settings.overwrite" inputId="overwrite" binary />
            <label for="overwrite"> 打包覆盖原文件 </label>
          </div>
          <div class="text-sm text-gray-400"><p>将翻译结果直接保存到原miz文件</p></div>
        </div>

        <div class="flex flex-col mb-4">
          <div class="flex mb-1 gap-2">
            <Checkbox v-model="settings.backup" inputId="backup" binary />
            <label for="backup"> 覆盖原文件时创建备份 </label>
          </div>
          <div class="text-sm text-gray-400"><p>打包前备份原miz文件</p></div>
        </div>

        <div class="flex flex-col mb-4">
          <div class="flex mb-1 gap-2">
            <Checkbox v-model="settings.translate_compare" inputId="translate_compare" binary />
            <label for="translate_compare"> 对照模式 </label>
          </div>
          <div class="text-sm text-gray-400"><p>同时显示两种语言</p></div>
        </div>

        <h1 class="text-xl py-5" name="prompt" id="prompt">翻译提示词</h1>

        <div class="flex flex-col mb-4 gap-1">
          <label for="chat_prompt">问答提示词</label>
          <Textarea
            id="chat_prompt"
            size="small"
            class=""
            v-model="settings.chat_prompt"
            autoResize
            variant="filled"
          />
          <p class="text-sm text-gray-400">
            该提示词将有助于在问答过程中让LLM模型更好地理解问题， {miz_data}
            用来代表任务简报信息，是问答题提示词的关键内容，请勿删除
          </p>
        </div>

        <div class="flex flex-col mb-4 gap-1">
          <label for="translate_prompt">翻译提示词</label>
          <Textarea
            id="translate_prompt"
            size="small"
            class=""
            v-model="settings.translate_prompt"
            autoResize
            variant="filled"
          />
          <p class="text-sm text-gray-400">该提示词将引导LLM模型翻译文本</p>
        </div>

        <h1 class="text-xl py-5" name="ollama" id="ollama">Ollama</h1>

        <div class="flex flex-col mb-4 gap-1">
          <label for="ollama_host">API地址</label>
          <InputText
            id="ollama_host"
            class="flex-1"
            v-model="settings.ollama_host"
            variant="filled"
            placeholder="http://127.0.0.1:11434"
          />
        </div>

        <div class="flex flex-col mb-4 gap-1">
          <label for="ollama_model">模型</label>
          <div class="flex gap-4">
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
        </div>

        <div class="flex flex-col mb-4 gap-1">
          <label for="ollama_context_limit">最大上下文长度</label>
          <div class="flex gap-5">
            <Slider v-model="settings.ollama_context_limit" min="0" max="30" class="w-56 my-5" />
            <InputText size="small" v-model.number="settings.ollama_context_limit" class="w-12" />
          </div>
        </div>

        <div class="flex flex-col mb-4 gap-1">
          <label for="ollama_model">温度</label>
          <div class="flex gap-5">
            <Slider
              v-model="settings.ollama_temperature"
              min="0"
              max="1"
              step="0.01"
              class="w-56 my-5"
            />
            <InputText size="small" v-model.number="settings.ollama_temperature" class="w-12" />
          </div>
          <div class="text-sm text-gray-400"><p>严谨与想象 数值低结果趋向严谨，数值高结果趋向想象</p></div>
        </div>

      
        <h1 class="text-xl py-5" id="about" name="about">关于 mizTranslatorAI</h1>

        <div class="flex flex-col mb-4">
          <div class="flex mb-1 gap-2">
            <span for="overwrite">当前版本: 1.0.0 EA</span>
          </div>

          <div class="flex mb-1 gap-2">
            <span for="overwrite">作者: lith</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#preference {
  background-color: #18181b;
  scroll-behavior: smooth;
}

.scroll-smooth {
  scroll-behavior: smooth;
}
</style>
