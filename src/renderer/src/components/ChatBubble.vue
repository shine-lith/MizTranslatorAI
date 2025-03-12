<script setup>
import { ref } from 'vue'

const props = defineProps({
  type: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    default: 'Welcome to Syria, Battle Angel!',
    required: true
  },
  dictkey: {
    type: String,
    default: 'DictKey-1000',
    required: true
  },
  timestamp: {
    type: String,
    default: '刚刚'
  }
})

const emit = defineEmits(['resend'])

const isHovering = ref(false)

const handleResend = () => {
  emit('resend', props.message)
}
</script>

<template>
  <transition name="fly-in" appear>
    <!-- 用户发送的消息 -->
    <div v-if="type === 'send'">
      <div
        class="fly-in flex items-start text-sm"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <!-- 气泡 -->
        <div class="">
          <div class="">
            <p>> {{ message }}</p>
          </div>
        </div>
        <!-- 重发按钮 -->
        <button v-show="isHovering" @click="handleResend" class="my-auto">↻</button>
      </div>
    </div>

    <!-- 返回的消息 -->
    <div v-else-if="type === 'receive'">
      <div class="flex items-start text-sm">
        <div class="max-w-[100%]">
          <div class="">
            <p>
              美国黑鹰直升机队在25日午夜2点左右——比布罗布鲁战役之前一周的夜晚，执行巡逻任务时被…型号为
              courage 53）。军方黑鹰直升机队在此次行动中至少有一架受损后返回了基地。
            </p>
            <span class="text-xs mt-1 block">Dickkey-122</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'system'">
      <!-- 系统消息 -->
      <div class="text-center text-sm text-gray-500 py-2">张三加入了聊天</div>
    </div>
  </transition>
</template>

<style scoped>
/* 定义关键帧动画 */
@keyframes flyIn {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fly-in-enter-active {
  animation: flyIn 0.3s ease-out;
}
</style>
