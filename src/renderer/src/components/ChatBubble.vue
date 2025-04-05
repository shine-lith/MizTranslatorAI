<script setup>
import { ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  dictkey: {
    type: String,
    required: true
  },
  question_id: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean
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
    <div v-if="type === 'user'">
      <div
        class="fly-in flex items-start text-sm hover:bg-zinc-800"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <!-- 气泡 -->
        <div class="max-w-[100%] flex">
          <i class="pi pi-chevron-right text-xs m-1"></i>
          <div class="text-justify">
            <span>{{ message }}</span>
          </div>
        </div>
        <!-- 重发按钮 -->
        <!-- <button v-show="isHovering" @click="handleResend" class="my-auto">↻</button> -->
      </div>
    </div>

    <!-- 返回的消息 -->
    <div v-else-if="type === 'assistant'">
      <div class="flex items-start text-sm hover:bg-zinc-800">
        <div class="max-w-[100%] flex items-start">
          <i v-if="loading === true" class="pi pi-spin pi-spinner text-xs m-1"></i>
          <i v-else class="pi pi-circle text-xs m-1"></i>
          <div class="">
            <p v-if="message === ''">等待回复</p>
            <p v-else>{{ message }}</p>
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
    transform: translateX(-50px);
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
