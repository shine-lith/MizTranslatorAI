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
        messages: [{
          role: 'user', content: text 
        }],
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
    var result = { 
      from: res.model,
      raw: res.message,
      text: text,
      result: [res.message.content],
    };
    this.thenCallback(result);
  }
}

export { TranslateOllama };
