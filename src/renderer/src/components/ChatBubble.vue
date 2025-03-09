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
        class="fly-in flex items-start gap-3 justify-end"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <!-- 重发按钮 -->
        <button v-show="isHovering" @click="handleResend" class="my-auto">↻</button>
        <!-- 气泡 -->
        <div class="max-w-[70%]">
          <div class="bg-blue-500 text-white p-3 rounded-lg">
            <p>{{ message }}</p>
            <span class="text-xs text-blue-200 mt-1 block">{{ dictkey }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回的消息 -->
    <div v-else-if="type === 'receive'">
      <div class="flex items-start gap-3">
        <div class="max-w-[100%]">
          <div class="p-3 rounded-lg shadow-sm">
            <p>
              消息部分，每条消息应该用flex布局，根据发送者决定flex-row或flex-row-reverse。时间戳要小字，灰色，放在消息气泡下方。头像或用户图标可能用圆形的div，显示用户名的首字母，比如对方用A，自己用B。
            </p>
            <span class="text-xs text-gray-400 mt-1 block">Dickkey-122</span>
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
