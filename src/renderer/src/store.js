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
  mission_data: null
})

export const settings = useStorage('settings', {
  overwrite: true,
  backup: false,
  translate_compare: false,
  chat_prompt:
    '你是一个军事参谋，即将展开一次军事行动，之后会提供这次行动的必要信息。你需要结合这些信息，回答用户提出的问题并尽可能全面的提供帮助。使用中文进行回答。以下是这次行动的信息：\r\n{miz_data}',
  translate_prompt:
    '为军事模拟飞行游戏进行内容翻译，将用户输入的内容翻译为中文\r\n直接返回翻译结果，不需要进一步明确\r\n说话的人(以:开头)、人名、地名、代号、呼号、编号、军事术语、缩写保持原文\r\n如果是程序代码则返回原文',
  ollama_host: 'http://127.0.0.1:11434',
  ollama_model: null,
  ollama_model_list: null,
  ollama_context_limit: 20,
  ollama_temperature: 0.3
})
