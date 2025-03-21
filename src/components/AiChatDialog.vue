<script setup>
import { ref } from 'vue'
import { Close, ArrowLeft, ArrowRight, Search, Monitor } from '@element-plus/icons-vue'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:visible'])
const isDeepSeekEnabled = ref(false)

const chatHistory = ref([
  {
    type: 'ai',
    content: '👋 Hi，我是牛客AI智搜助手\n我可以帮你查找、总结校招求职相关问题～',
  },
])

const inputMessage = ref('')

// 修改发送消息方法
const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  const userMessage = inputMessage.value.trim()

  // 添加用户消息
  chatHistory.value.push({
    type: 'user',
    content: userMessage,
  })

  // 清空输入
  inputMessage.value = ''

  // 模拟AI回复
  setTimeout(() => {
    chatHistory.value.push({
      type: 'ai',
      content: '我理解您的问题，让我为您解答...',
    })
  }, 500)
}

const quickQuestions = [
  '投简历无回复怎么办?',
  '拼多多技术岗笔试题',
  '字节买习内推',
  '分享一下美团面经',
]

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="(newVal) => emit('update:visible', newVal)"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    width="500px"
    class="chat-dialog"
  >
    <template #header>
      <div class="dialog-header">
        <el-button type="text" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div class="dialog-title">
          <el-icon class="ai-logo"><Search /></el-icon>
          <span>智搜</span>
        </div>
        <el-button type="text" @click="handleClose" class="close-button">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </template>

    <div class="chat-container">
      <div class="chat-history" ref="chatHistory">
        <div
          v-for="(message, index) in chatHistory"
          :key="index"
          :class="['message', message.type]"
        >
          <div class="message-content">{{ message.content }}</div>
        </div>
      </div>

      <div class="quick-questions" v-if="chatHistory.length === 1">
        <div class="section-title">你可以这样问我</div>
        <div class="questions-list">
          <div
            v-for="(question, index) in quickQuestions"
            :key="index"
            class="question-item"
            @click="inputMessage = question"
          >
            {{ question }}
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="chat-footer">
        <div class="deep-seek">
          <el-icon class="deep-seek-icon"><Monitor /></el-icon>
          <span>深度用户</span>
          <el-switch v-model="isDeepSeekEnabled" />
        </div>
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            placeholder="输入你想问的..."
            type="text"
            @keyup.enter.prevent="sendMessage"
          >
            <template #append>
              <el-button type="primary" @click="sendMessage" class="send-button">发送</el-button>
            </template>
          </el-input>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.chat-dialog :deep(.el-dialog) {
  border-radius: 16px;
  margin-top: 8vh !important;
  margin-right: 40px !important;
  margin-left: auto !important;
  background: linear-gradient(180deg, #f8fdff 0%, #ffffff 100%);
  overflow: hidden;
}

.chat-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.chat-dialog :deep(.el-dialog__body) {
  padding: 0;
  height: 500px;
  overflow-y: auto;
}

.chat-dialog :deep(.el-dialog__footer) {
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  gap: 8px;
}

.ai-logo {
  font-size: 24px;
  color: #42d392;
}

.back-button,
.close-button {
  padding: 8px;
  color: #666;
}

.chat-container {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
}

.chat-history {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message-content {
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  background-color: #f5f7fa;
  color: #333;
}

.quick-questions {
  margin-top: 24px;
}

.section-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

.question-item:hover {
  background-color: #e6f1fc;
  color: #2b6fc2;
}

.arrow-icon {
  color: #999;
}

.chat-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.deep-seek {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  font-size: 13px;
  color: #666;
}

.deep-seek-icon {
  font-size: 16px;
  color: #666;
}

.chat-input {
  display: flex;
  align-items: center;
}

.chat-input :deep(.el-input__wrapper) {
  border-radius: 24px 0 0 24px;
  padding-right: 0;
}

.chat-input :deep(.el-input-group__append) {
  padding: 0;
  border: none;
  background: transparent;
}

.send-button {
  border-radius: 0 24px 24px 0;
  height: 40px;
  padding: 0 24px;
  font-size: 14px;
  background: #42d392;
  border-color: #42d392;
  margin: 0;
}

.send-button:hover {
  background: #33bb7a;
  border-color: #33bb7a;
}
</style>
