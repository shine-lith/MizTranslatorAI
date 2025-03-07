// store.js
import { reactive } from 'vue'

export const store = reactive({
    // miz文件的路径
    mizFile: null,
    // 工程的路径
    projectPath: null,
    // miz Dict数据
    listdata: null,
})