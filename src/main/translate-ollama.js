import { Ollama } from 'ollama'
import retry from 'async-retry'

const DEFAULT_CONFIG = {
  // ollama host
  host: 'http://127.0.0.1:11434',
  // 默认最大重试次数
  maxRetries: 3, 
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
  async #executeRequest(request) {
    try {
      return await retry(
        async (bail) => {
          try {
            const response = await this.ollama.chat(request)
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
  // async translate(text, options = {}) {
  //   try {
  //     const response = await this.#executeRequest(text, history, options)
  //     return this.#parseResult(text, response)
  //   } catch (error) {
  //     throw new Error(`Translation failed: ${error.message}`)
  //   }
  // }

  // 流式翻译方法
  async *translateStream(request) {
    try {
      const response = await this.#executeRequest(request)
      for await (const chunk of response) {
          yield this.#parseChunk(chunk)
      }
    } catch (error) {
      throw new Error(`Stream translation failed: ${error.message}`)
    }
  }

  // 模拟的流式翻译方法
  // async *translateStreamFake(text, option={}){
  //   try{
  //     const k = 'Dictxxxx'
  //     var chunks = [
  //       { key:k, partial: 'RAV', done:false},
  //       { key:k, partial: 'EN ', done:false},
  //       { key:k, partial: '1-1', done:false},
  //       { key:k, partial: '（刀', done:false},
  //       { key:k, partial: '锋）', done:false},
  //       { key:k, partial: '：确', done:false},
  //       { key:k, partial: '认，', done:false},
  //       { key:k, partial: '南方', done:false},
  //       { key:k, partial: '5英', done:false},
  //       { key:k, partial: '里处', done:false},
  //       { key:k, partial: '有一', done:false},
  //       { key:k, partial: '架加', done:false},
  //       { key:k, partial: '油机', done:false},
  //       { key:k, partial: '，另', done:false},
  //       { key:k, partial: '一架', done:false},
  //       { key:k, partial: '……', done:false},
  //       { key:k, partial: '在东', done:false},
  //       { key:k, partial: '方7', done:false},
  //       { key:k, partial: '英里', done:false},
  //       { key:k, partial: '处。', done:false},
  //     ];
  //     for (let i = 0; i < 5; i++) {
  //       chunks = chunks.concat(chunks);
  //     }
  //     chunks.push({key:k, partial: '', done:true})
      
  //     for (const chunk of chunks) {
  //       await new Promise(resolve => setTimeout(resolve, 10));
  //       yield chunk;
  //     }
  //   } catch (error){

  //   }
  // }

  // 解析结果
  // #parseResult(text, response) {
  //   const resultText = response.message.content//.replace(/<think\b[^>]*>[\s\S]*?<\/think>/g, '')

  //   return {
  //     from: response.model,
  //     raw: response.message,
  //     text: text,
  //     result: resultText
  //   }
  // }

  // 解析流式数据块
  #parseChunk(chunk) {
    return {
      partial: chunk.message.content,
      done: chunk.done || false
    }
  }

  // 获取ollama安装的模型
  getModelList() {
    return this.ollama.list()
  }
}

export { TranslateOllama }
