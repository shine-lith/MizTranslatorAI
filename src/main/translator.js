import { TranslateOllama } from "./translate-ollama";

const BY_CACHE = "cache";
const BY_NET = "net";

/**
 * 单翻译队列
 */
class Translator {
  constructor(name, api) {
    // 翻译源名称
    this.sourceName = name;
    // 翻译源API
    this.api = api;
    // 服务运行状态
    this.isRunning = false;
    // 任务队列
    this.tasks = new Array();
    // 缓存数据库
    this.db = null;
    // 队列模式
    this.isQueue = false;
    // 队列退出标志
    this.isQueueInterrupted = false;
    // 队列模式回调
    this.queueFinishCallback = null;
    // 为api添加 translator的句柄
    if (this.api.setTranslator) {
      this.api.setTranslator(this);
    }
    this.store = null;
  }

  // 设置缓存数据库
  setCacheDb(db) {
    this.db = db;
  }

  // 设置队列完成时的回调
  setQueueFinishCallback(cb) {
    this.queueFinishCallback = cb;
  }

  // 注入Settings
  setSetting(store) {
    this.store = store;
  }

  // 获取Settings
  getSettings() {
    return this.store;
  }

  // 添加翻译任务
  translate(stamp, text, callback, queue = false) {
    text = text.replace(/(\r\n|\r|\n){2}/g, "$1").replace(/(\r\n|\r|\n){3,}/g, "$1\n");
    var task = {
      stamp: stamp,
      text: text,
      callback: callback,
    };

    /**
     * 队列模式
     * 无论当前是否有任务，都可以变成队列模式
     */
    if (queue) {
      this.isQueue = true;
      this.isQueueInterrupted = false;
      this.tasks.push(task);
      console.log(task.stamp + " " + this.sourceName + " Queue Push");
    }

    /**
     * 普通模式请求
     * 在普通模式下，翻译队列只允许2个任务，在第一个任务完成前，所有后续任务只保留最后一次请求的任务
     */
    if (!queue) {
      // 如果服务正在以队列模式运行则提示占用
      if (this.isRunning && this.isQueue) {
        callback(this.sourceName, task, { error: { errorCode: "BUSY" } });
        return;
      }
      // 只缓冲2个任务
      if (!this.tasks[0]) {
        this.tasks[0] = task;
      } else {
        this.tasks[1] = task;
      }
      console.log(task.stamp + " " + this.sourceName + " Add ");
    }

    if (!this.isRunning) {
      this.run();
    }
  }

  // 从缓存中查找翻译结果
  readCache(task) {
    if (this.db) {
      var r = this.db
        .get("cache")
        .find({ translateStamp: task.stamp })
        .value();
      if (r && r[this.sourceName]) return r[this.sourceName];
    }
  }

  // 将翻译结果写入缓存
  writeCache(task, result) {
    if (this.db) {
      var obj = this.db
        .get("cache")
        .find({ translateStamp: task.stamp })
        .value();
      if (obj) {
        this.db
          .get("cache")
          .find({ translateStamp: task.stamp })
          .set([this.sourceName], result)
          .write();
      } else {
        this.db
          .get("cache")
          .push({
            translateStamp: task.stamp,
            [this.sourceName]: result,
          })
          .write();
      }
    }
  }

  // 执行翻译任务
  run() {
    this.isRunning = true;
    var task = this.tasks[0];

    var apiRequest = (task) => {
      // 翻译完成处理
      var success = (response, method) => {
        if (!this.isQueueInterrupted) {
          task.callback(this.sourceName, task, response);
          console.log(task.stamp + " " + this.sourceName + " Callback");
        }

        var needWait = true;
        if (method == BY_CACHE) {
          needWait = false;
        }

        this.loop(needWait);
      };

      // 翻译失败处理
      var fail = (error) => {
        if (!this.isQueueInterrupted) {
          task.callback(this.sourceName, task, { error: { errorCode: error.code } });
          console.log(task.stamp + " " + this.sourceName + " Err " + error.code);
        }
        this.loop(false);
      };

      // 翻译请求的主流程
      var cache = null;
      cache = this.readCache(task);
      if (cache) {
        success(cache, BY_CACHE);
        console.log(task.stamp + " " + this.sourceName + " Cached");
      } else {
        // 从网络请求
        this.api.translate(task.text).then((result) => {
            this.writeCache(task, result);
            success(result, BY_NET);
          }).catch((error) => {
            fail(error);
          });

        // fs.readFile("httpRequest.json", (err, d) => {
        //   var result = JSON.parse(d);
        //   setTimeout(() => {
        //     success(result, BY_NET);
        //   }, Math.random() * 2000 + 1000);
        // });
        console.log(task.stamp + " " + this.sourceName + " Request");
      }
    };

    process.nextTick(() => apiRequest(task));
  }

  // needWait 是否需要延迟发起请求
  loop(needWait = true) {
    this.tasks.shift();
    // 判断是否需要停止
    if (this.isQueue && this.isQueueInterrupted) {
      console.log("queue Interrupted");
      this.reset();
      return;
    }
    if (this.tasks.length > 0) {
      // 继续任务
      if (needWait) {
        setTimeout(() => {
          this.run();
        }, 3000);
      } else {
        this.run();
      }
    } else {
      console.log("queue Finsihed");
      // 结束任务
      if (this.isQueue) {
        // 队列模式结束
        if (this.queueFinishCallback) {
          this.queueFinishCallback();
        }
        this.reset();
        return;
      }
      // 普通模式结束
      this.isRunning = false;
    }
  }

  // 重置状态
  reset() {
    this.isRunning = false;
    this.isQueue = false;
    this.isQueueInterrupted = false;
    this.queueFinishCallback = null;
    this.tasks = new Array();
    console.log("reset");
  }

  // 停止队列
  queueStop() {
    this.isQueueInterrupted = true;
    console.log("queue Stop");
  }
}

var ollamaTranslator = new Translator("ollama", new TranslateOllama());
export { ollamaTranslator };