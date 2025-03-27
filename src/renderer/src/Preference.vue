<script setup>
import { ref,onMounted } from 'vue'
import { useStorage } from '@vueuse/core'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea';
import IftaLabel from 'primevue/IftaLabel'
import Select from 'primevue/select'
import Slider from 'primevue/slider'

const settings = useStorage('ollama', {
    system_prompt: '你是一位精通多种语言的专业翻译，能够准确地将内容翻译为中文。翻译时，请保留原文的语气、风格和表达方式。请遵守以下规则：1、专有名词（例如人名和地名）无需翻译，应保留其原形。2、仔细检查并确保译文流畅准确。3、回复前，请根据译文重新润色，确保与原文内容一致，既不增也不减任何内容，并使译文通俗易懂，符合目标语言的表达习惯。4、最终输出仅有润色后的译文，隐藏所有的过程和解释，整个输出应直接可引用，无需任何编辑。',
    ollama_url: 'http://127.0.0.1:11434',
    ollama_model: null,
    ollama_model_list: null,
    ollama_context_limit: 20,
    ollama_temperature: 0.3
})

const ollamaModels = ref()
// 刷新Ollama模型列表
async function onOllamaList() {
    const result = await window.api.onOllamaList()
    let models = result.models.map(e=>e.name)
    ollamaModels.value = models
    settings.value.ollama_model_list = JSON.stringify(models)
}

onMounted(() => {
    if(settings.value.ollama_model_list)
        ollamaModels.value = JSON.parse(settings.value.ollama_model_list)
})

</script>
<template>
    <div id="preference" class="flex-col">
        <div class="flex-none">
            <Button label="返回"></Button>
        </div>
        
        <div class="flex flex-1">
            <div class="p-2 w-60">
                <ol>
                    <li class="p-5 hover:bg-sky-700">LLM 翻译设置</li>
                    <li class="p-5 hover:bg-sky-700">Ollama</li>
                </ol>
            </div>
            <div class="flex-1 flex flex-col gap-2 pr-10">
       
                <h2 id="setting">翻译设置</h2>
                <label for="system_prompt">系统提示词</label>
                <Textarea id="system_prompt" v-model="settings.system_prompt" autoResize variant="filled" />

                <h2>Ollama</h2>
                <label for="ollama_url">API地址</label>
                <InputText id="ollama_url" class="flex-1" v-model="settings.ollama_url" variant="filled" placeholder="http://127.0.0.1:11434" />
                
                
                <label for="ollama_model">模型</label>
                <div class="flex gap-5">
                    <Select id="ollama_model" v-model="settings.ollama_model" :options="ollamaModels" placeholder="选择一个模型" checkmark :highlightOnSelect="false" class="w-full md:w-56" />
                    <Button :disabled="settings.ollama_url == ''" @click="onOllamaList" label="刷新模型列表" severity="secondary" />
                </div>

                <label for="ollama_context_limit">最大上下文长度</label>
                <div class="flex gap-5">
                    <Slider v-model="settings.ollama_context_limit" min="0" max="30" class="w-56 my-5" />
                    <InputText v-model.number="settings.ollama_context_limit" class="w-12" />
                </div>

                <label for="ollama_model">温度</label>
                <div class="flex gap-5">
                    <Slider v-model="settings.ollama_temperature" min="0" max="1" step="0.01" class="w-56 my-5" />
                    <InputText v-model.number="settings.ollama_temperature" class="w-12" />
                </div>
            </div>
        </div>
    </div>
</template>