import { Ollama } from 'ollama'

class TranslateOllama {
  constructor() {}

  setTranslator(translator) {
    this.translator = translator;
  }

  translate(text) {
    var that = this;
    (async () => {
        const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })
        const response = await ollama.chat({
        model: 'deepseek-r1:7b',
        messages: [
          {
            role: 'system',
            content: '你是一名专业翻译,具有军事专业知识，严格遵守要求。将用户的文本翻译成中文，保持原意，无需解释。'
          },
          {
            role: 'user',
            content: text
          }],
        keep_alive: "3m",
        options: {
          temperature: 0.3 // 降低随机性以提高翻译准确性
        }
        })

      if (response.message.role == 'assistant'){
        that.parseResult(text, response)
      }
    })();
    
    return this;
  }

  then(thenCallback) {
    this.thenCallback = thenCallback;
    return this;
  }

  catch(catchCallback) {
    this.catchCallback = catchCallback;
    return this;
  }

  parseResult(text, res) {
    var result_text = res.message.content.replace(/<think\b[^>]*>[\s\S]*?<\/think>/g, '');
    var result = { 
      from: res.model,
      raw: res.message,
      text: text,
      result: result_text,
    };
    this.thenCallback(result);
  }
}

export { TranslateOllama };
