// store.js
import { reactive } from 'vue'
import { useStorage } from '@vueuse/core'

// 字符串资源类型映射/设置表
export const miz_dictkey = {
  sortie: { text: '1.任务名称', keep: true },
  descriptionText: { text: '2.形势', keep: true },
  descriptionRedTask: { text: '3.红方任务', keep: true },
  descriptionBlueTask: { text: '4.蓝方任务', keep: true },
  descriptionNeutralsTask: { text: '5.中立任务', keep: true },
  WptName: { text: '路点名', keep: false },
  UnitName: { text: '单位名', keep: false },
  GroupName: { text: '群组名', keep: false },
  ActionComment: { keep: false },
  ActionRadioText: { text: '菜单项', keep: true },
  ActionText: { text: '提示信息', keep: true },
  subtitle: { text: '字幕', keep: true }
}

export const store = reactive({
  // miz文件的路径
  mizFile: null,
  // 工程的路径
  projectPath: null,
  // miz Dict数据
  listdata: null,
  // 任务信息
  mission_data: null,
})

export const settings = useStorage('settings', {
  chat_prompt:'你是一个军事顾问，马上将要开展一个军事行动，之后会提供这次行动的必要信息。你需要结合这些信息，回答用户提出的问题并尽可能全面的提供已知信息。使用中文进行回答。以下是这次行动的信息：{miz_data}',
  system_prompt:
    '你是一位精通多种语言的专业翻译，能够准确地将内容翻译为中文。翻译时，请保留原文的语气、风格和表达方式。请遵守以下规则：1、专有名词（例如人名和地名）无需翻译，应保留其原形。2、仔细检查并确保译文流畅准确。3、回复前，请根据译文重新润色，确保与原文内容一致，既不增也不减任何内容，并使译文通俗易懂，符合目标语言的表达习惯。4、最终输出仅有润色后的译文，隐藏所有的过程和解释，整个输出应直接可引用，无需任何编辑。',
  ollama_host: 'http://127.0.0.1:11434',
  ollama_model: null,
  ollama_model_list: null,
  ollama_context_limit: 20,
  ollama_temperature: 0.3
})
