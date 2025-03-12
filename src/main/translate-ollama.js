import { Ollama } from 'ollama'
import retry from 'async-retry'

const DEFAULT_CONFIG = {
  host: 'http://127.0.0.1:11434',
  model: 'deepseek-r1:7b',
  maxRetries: 3, // 默认最大重试次数
  temperature: 0.3,
  keepAlive: '3m'
}

class TranslateOllama {
  constructor(config = {}) {
    // 合并配置
    this.config = { ...DEFAULT_CONFIG, ...config }

    // 初始化Ollama实例
    this.ollama = new Ollama({
      host: this.config.host
    })
  }

  // 带重试和超时的请求核心方法
  async #executeRequest(text, options) {
    try {
      return await retry(
        async (bail) => {
          try {
            const response = await this.ollama.chat({
              model: this.config.model,
              messages: [
                {
                  role: 'system',
                  content:
                    '你是一名专业翻译，具有军事专业知识，严格遵守要求。将用户的文本翻译成中文，保持原意，无需解释。'
                },
                { role: 'user', content: text }
              ],
              keep_alive: this.config.keepAlive,
              options: {
                temperature: this.config.temperature
              },
              stream: options.stream
            })
            return response
          } catch (error) {
            //bail(error) 不重试直接退出
            throw error
          }
        },
        {
          retries: this.config.maxRetries,
          minTimeout: 1000,
          maxTimeout: 5000,
          factor: 2
        }
      )
    } finally {
    }
  }

  // 标准翻译方法
  async translate(text, options = {}) {
    try {
      const response = await this.#executeRequest(text, options)
      return this.#parseResult(text, response)
    } catch (error) {
      throw new Error(`Translation failed: ${error.message}`)
    }
  }

  // 流式翻译方法
  async *translateStream(text, options = {}) {
    try {
      const response = await this.#executeRequest(text, { ...options, stream: true })

      for await (const chunk of response) {
        if (chunk.message?.content) {
          yield this.#parseChunk(chunk)
        }
      }
    } catch (error) {
      throw new Error(`Stream translation failed: ${error.message}`)
    }
  }

  // 解析结果
  #parseResult(text, response) {
    const resultText = response.message.content.replace(/<think\b[^>]*>[\s\S]*?<\/think>/g, '')

    return {
      from: response.model,
      raw: response.message,
      text: text,
      result: resultText
    }
  }

  // 解析流式数据块
  #parseChunk(chunk) {
    return {
      partial: chunk.message.content,
      done: chunk.done || false
    }
  }
}

export { TranslateOllama }
