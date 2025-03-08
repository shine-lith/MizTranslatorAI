
<script setup>
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button'

const value = ref(null);
</script>

<template>
        <!-- 顶部导航 -->
        <div class="p-4">
            <div class="flex items-center">
                <div class="flex-1">
                    <h1 class="font-semibold text-xl">LLM辅助</h1>
                    <p class="text-sm text-gray-500">Ollama - DeepSeek-r1:32b</p>
                </div>
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                </div>
            </div>
        </div>

        <div class="flex-1 overflow-y-auto ">
            <!-- 对方消息 -->
            <div class="flex items-start gap-3">
                <div class="max-w-[100%]">
                    <div class="p-3 rounded-lg shadow-sm">
                        <p>消息部分，每条消息应该用flex布局，根据发送者决定flex-row或flex-row-reverse。时间戳要小字，灰色，放在消息气泡下方。头像或用户图标可能用圆形的div，显示用户名的首字母，比如对方用A，自己用B。</p>
                        <span class="text-xs text-gray-400 mt-1 block">Dickkey-122</span>
                    </div>
                </div>
            </div>

            <!-- 自己发送的消息 -->
            <div class="flex items-start gap-3 justify-end">
                <div class="max-w-[70%]">
                    <div class="bg-blue-500 text-white p-3 rounded-lg shadow-sm">
                        <p>Welcome to Syria, Battle Angel!</p>
                        <span class="text-xs text-blue-200 mt-1 block">Dickkey-123</span>
                    </div>
                </div>
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">B</div>
            </div>

            <!-- 对方消息 -->
            <div class="flex items-start gap-3">
                <div class="max-w-[100%]">
                    <div class="p-3 rounded-lg shadow-sm">
                        <p>色，放在消息气泡下方。头像或用户图标可能用圆形的div，显示用户名的首字母，比如对方用A，自己用B。</p>
                        <span class="text-xs text-gray-400 mt-1 block">Dickkey-123</span>
                    </div>
                </div>
            </div>

            <!-- 系统消息 -->
            <div class="text-center text-sm text-gray-500 py-2">
                张三加入了聊天
            </div>

            <!-- 自己发送的消息 -->
            <div class="flex items-start gap-3 justify-end">
                <div class="max-w-[70%]">
                    <div class="bg-blue-500 text-white p-3 rounded-lg shadow-sm">
                        <p>Welcome to Syria, Battle Angel!</p>
                        <span class="text-xs text-blue-200 mt-1 block">Dickkey-123</span>
                    </div>
                </div>
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">B</div>
            </div>

            <!-- 对方消息 -->
            <div class="flex items-start gap-3">
                <div class="max-w-[100%]">
                    <div class="p-3 rounded-lg shadow-sm">
                        <p>色，放在消息气泡下方。头像或用户图标可能用圆形的div，显示用户名的首字母，比如对方用A，自己用B。</p>
                        <span class="text-xs text-gray-400 mt-1 block">Dickkey-123</span>
                    </div>
                </div>
            </div>

             <!-- 自己发送的消息 -->
             <div class="flex items-start gap-3 justify-end">
                <div class="max-w-[70%]">
                    <div class="bg-blue-500 text-white p-3 rounded-lg shadow-sm">
                        <p>Welcome to Syria, Battle Angel!</p>
                        <span class="text-xs text-blue-200 mt-1 block">Dickkey-123</span>
                    </div>
                </div>
                <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">B</div>
            </div>

            <!-- 对方消息 -->
            <div class="flex items-start gap-3">
                <div class="max-w-[100%]">
                    <div class="p-3 rounded-lg shadow-sm">
                        <p>色，放在消息气泡下方。头像或用户图标可能用圆形的div，显示用户名的首字母，比如对方用A，自己用B。</p>
                        <span class="text-xs text-gray-400 mt-1 block">Dickkey-123</span>
                    </div>
                </div>
            </div>

        </div>
        
        <div class="p-4 flex gap-2">
            <InputText class="border-none flex-1" placeholder="给LLM发送消息" aria-multiline />
            <Button class="ml-4" aria-multiline rounded icon="pi pi-arrow-up" size="small" />
        </div>
</template>
  