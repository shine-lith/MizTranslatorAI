// store.js
import { reactive } from 'vue'
import { useStorage } from '@vueuse/core'

export const store = reactive({
  // miz文件的路径
  mizFile: null,
  // 工程的路径
  projectPath: null,
  // miz Dict数据
  listdata: null
})

export const settings = useStorage('settings', {
  system_prompt: '你是一位精通多种语言的专业翻译，能够准确地将内容翻译为中文。翻译时，请保留原文的语气、风格和表达方式。请遵守以下规则：1、专有名词（例如人名和地名）无需翻译，应保留其原形。2、仔细检查并确保译文流畅准确。3、回复前，请根据译文重新润色，确保与原文内容一致，既不增也不减任何内容，并使译文通俗易懂，符合目标语言的表达习惯。4、最终输出仅有润色后的译文，隐藏所有的过程和解释，整个输出应直接可引用，无需任何编辑。',
  ollama_url: 'http://127.0.0.1:11434',
  ollama_model: null,
  ollama_model_list: null,
  ollama_context_limit: 20,
  ollama_temperature: 0.3
})