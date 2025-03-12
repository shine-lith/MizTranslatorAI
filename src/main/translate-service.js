import { ollamaTranslator } from './translator'
/**
 * 翻译调度
 * 负责管理多个Translator进行翻译
 */
class TranslateService {
  constructor() {
    this.translators = [ollamaTranslator]
    this.queueTranslator = null
    this.db = null
  }

  // 设置缓存数据库
  setCacheDb(db) {
    this.db = db
    this.queueFinishCallback = null
    this.translators.forEach((translator) => {
      translator.setCacheDb(this.db)
    })
  }

  // 添加翻译任务
  translate(sources, stamp, text, callback, queue = false, store) {
    sources.forEach((source) => {
      var translator = this.translators.find((translator) => {
        return translator.sourceName == source
      })
      translator.setSetting(store)
      translator.translate(stamp, text, callback, queue)
    })
  }

  // 批量翻译任务
  translateBatch(source, data, finishCallback, finishAllCallback, store) {
    var translator = this.translators.find((translator) => {
      return translator.sourceName == source
    })
    this.queueTranslator = translator
    translator.setQueueFinishCallback(finishAllCallback)
    translator.setSetting(store)
    data.forEach((item) => {
      if (item.originText.trim().length > 1) {
        translator.translate(
          item.translateStamp,
          item.originText,
          (source, work, result) => {
            finishCallback(source, work, result, item)
          },
          true
        )
      }
    })
  }

  stopBatch() {
    if (this.queueTranslator) {
      this.queueTranslator.queueStop()
    }
  }
}

var translateService = new TranslateService()
export { translateService }
