<script setup>
import { ref, nextTick, onMounted, reactive, computed } from 'vue'
import { marked } from 'marked'
import { useDifyChat } from '@/composables/useDifyChat'
import { useUserStore } from '@/stores'
import ConfigPanel from '@/components/ConfigPanel.vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'

// 响应式数据
const configPanel = ref(null)
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const messagesContainer = ref(null)
const showConfigPanel = ref(false)
const isConnected = ref(false)

// 获取用户store
const userStore = useUserStore()

// 计算当前用户信息
const currentUser = computed(() => {
  const user = userStore.userinfo
  console.log('ChatInterface - userStore.userinfo:', user) // 调试信息

  if (user && user.username) {
    const result = {
      id: user.username,
      username: user.username,
      nickname: user.nickname || user.username,
      avatar: user.avatar || null
    }
    console.log('ChatInterface - currentUser computed result:', result) // 调试信息
    return result
  }

  // 如果未登录返回null
  console.log('ChatInterface - user not logged in') // 调试信息
  return null
})

// 计算是否已登录
const isLoggedIn = computed(() => {
  return currentUser.value !== null
})

// 获取游客用户信息（仅用于显示）
const getGuestUser = () => {
  return {
    id: 'guest_' + Date.now(),
    username: '游客',
    nickname: '游客',
    avatar: null
  }
}

// 聊天配置
const chatConfig = reactive({
  apiKey: 'app-zV1H0vnzPlwjUkkexGCmF5Gn',
  baseUrl: '/v1',
  userId: computed(() => currentUser.value?.id || 'guest_' + Date.now()) // 使用可选链操作符
})

// 使用Dify聊天API
const { sendChatMessage, resetConversation: resetChatConversation } = useDifyChat()

// 加载保存的配置
const loadSavedConfig = () => {
  const saved = localStorage.getItem('dify-chat-config')
  if (saved) {
    try {
      const config = JSON.parse(saved)
      Object.assign(chatConfig, config)
    } catch (error) {
      console.warn('加载保存的配置失败:', error)
    }
  }
}

// 添加欢迎消息
onMounted(() => {
  loadSavedConfig()

  // 根据用户登录状态显示个性化欢迎消息
  const welcomeMessage = currentUser.value === null
    ? '您好！我是武汉理工大学南湖校区羽毛球馆的智能客服。我可以为您提供场馆信息、预订服务等帮助。请问有什么可以为您效劳的吗？\n\n您可以问我：\n- 有几个羽毛球场？\n- 羽毛球馆的开放时间？\n- 如何预订场地？\n- 场馆位置和交通？'
    : `您好${currentUser.value.nickname}！欢迎回来！我是武汉理工大学南湖校区羽毛球馆的智能客服。我可以为您提供场馆信息、预订服务等帮助。请问有什么可以为您效劳的吗？\n\n您可以问我：\n- 有几个羽毛球场？\n- 羽毛球馆的开放时间？\n- 如何预订场地？\n- 场馆位置和交通？\n- 查看我的预订记录`;

  messages.value.push({
    id: Date.now(),
    type: 'assistant',
    content: welcomeMessage,
    timestamp: new Date()
  })

  configPanel.value.testConnection()
})

// 发送消息
const sendMessage = async () => {
  // 检查登录状态
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录后再使用AI客服功能')
    return
  }

  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMessage)
  const query = inputMessage.value
  inputMessage.value = ''
  isLoading.value = true
  errorMessage.value = ''

  try {
    // 创建助手消息
    const assistantMessage = {
      id: Date.now() + 1,
      type: 'assistant',
      content: '',
      timestamp: new Date()
    }
    messages.value.push(assistantMessage)

    // 准备用户选项，使用真实的用户信息
    const userOptions = {
      user: currentUser.value.id,
      // 可以在这里添加更多用户相关的元数据
      meta: {
        username: currentUser.value.username,
        nickname: currentUser.value.nickname,
        avatar: currentUser.value.avatar
      }
    }

    // 发送到Dify API并处理流式响应，传递真实用户信息
    await sendChatMessage(query, (chunk) => {
      // 处理流式数据块
      if (chunk.event === 'message') {
        assistantMessage.content += chunk.answer || ''
        scrollToBottom()
      } else if (chunk.event === 'message_end') {
        // 消息结束，设置最终内容
        console.log('消息结束，元数据:', chunk.metadata)
        isConnected.value = true
      } else if (chunk.event === 'workflow_started') {
        isConnected.value = true
      }
    }, userOptions)
  } catch (error) {
    console.error('发送消息失败:', error)
    errorMessage.value = `发送消息失败：${error.message}`
    isConnected.value = false
    // 移除失败的助手消息
    messages.value = messages.value.filter(msg => msg.id !== messages.value[messages.value.length - 1].id)
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

// 处理配置变化
const handleConfigChange = (newConfig) => {
  Object.assign(chatConfig, newConfig)
  console.log('配置已更新:', chatConfig)
}

// 测试连接
const handleTestConnection = async (config) => {
  try {
    // 这里可以发送一个测试请求
    console.log('测试连接配置:', config)
    // 实际实现中应该调用API测试连接
    isConnected.value = true
  } catch (error) {
    console.error('连接测试失败:', error)
    isConnected.value = false
    throw error
  }
}

// 清空对话
const clearChat = () => {
  if (confirm('确定要清空所有对话记录吗？')) {
    const clearMessage = currentUser.value === null
      ? '对话已清空。请问有什么可以帮助您的？'
      : `对话已清空，${currentUser.value.nickname}。请问有什么可以帮助您的？`;

    messages.value = [{
      id: Date.now(),
      type: 'assistant',
      content: clearMessage,
      timestamp: new Date()
    }]
  }
}

// 重置会话
const resetConversation = () => {
  if (confirm('确定要开始新的会话吗？当前对话上下文将丢失。')) {
    resetChatConversation()

    const resetMessage = currentUser.value === null
      ? '新会话已开始。请问有什么可以帮助您的？'
      : `新会话已开始，${currentUser.value.nickname}。请问有什么可以帮助您的？`;

    messages.value = [{
      id: Date.now(),
      type: 'assistant',
      content: resetMessage,
      timestamp: new Date()
    }]
  }
}

// 格式化消息内容（支持Markdown）
const formatMessage = (content) => {
  if (!content) return ''
  return marked.parse(content)
}

// 格式化时间
const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>

<template>
  <div class="chat-container">
    <!-- 标题栏 -->
    <div class="chat-header">
      <div class="header-content">
        <h1>🏸 武汉理工大学南湖校区羽毛球馆智能客服</h1>
        <p>您好！我是羽毛球馆智能助手，有什么可以帮助您的？</p>
      </div>
      <!-- <button @click="showConfigPanel = true" class="config-btn" title="系统配置">
        ⚙️
      </button> -->
    </div>

    <!-- 消息区域 -->
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" class="message" :class="message.type">
        <div class="message-avatar" :class="{ 'has-user-avatar': message.type === 'user' && (currentUser?.avatar || getGuestUser().avatar) }">
          <span v-if="message.type === 'user'">
            <img v-if="(currentUser?.avatar || getGuestUser().avatar)" 
                 :src="(currentUser?.avatar || getGuestUser().avatar)" 
                 :alt="(currentUser?.nickname || getGuestUser().nickname)" 
                 class="user-avatar-img" />
            <span v-else>👤</span>
          </span>
          <span v-else>🤖</span>
        </div>
        <div class="message-content">
          <div class="message-text" v-html="formatMessage(message.content)"></div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
      </div>

      <!-- 正在输入指示器 -->
      <div v-if="isLoading" class="message assistant">
        <div class="message-avatar">
          <span>🤖</span>
        </div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input">
      <div class="input-container">
        <input
          v-model="inputMessage"
          @keyup.enter="sendMessage"
          :disabled="isLoading || !isLoggedIn"
          :placeholder="isLoggedIn ? '请输入您的问题...' : '请登录后使用'"
          class="message-input"
        />
        <button
          @click="sendMessage"
          :disabled="isLoading || !inputMessage.trim() || !isLoggedIn"
          class="send-button"
        >
          {{ isLoading ? '发送中...' : '发送' }}
        </button>
      </div>

      <!-- 登录提示 -->
      <div v-if="!isLoggedIn" class="login-prompt">
        <el-icon><Warning /></el-icon>
        <span>您当前未登录，请登录后使用AI客服功能</span>
        <el-button type="primary" size="small" @click="$router.push('/login')">
          立即登录
        </el-button>
      </div>

      <!-- 快捷操作 -->
      <div class="chat-shortcuts" v-if="isLoggedIn">
        <el-button @click="clearChat" type="info" size="small" title="清空对话">
          🗑️ 清空
        </el-button>
        <el-button @click="resetConversation" type="primary" size="small" title="新建会话">
          🆕 新会话
        </el-button>
        <span class="connection-status" :class="{ connected: isConnected }">
          {{ isConnected ? '已连接' : '未连接' }}
        </span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
      <button @click="errorMessage = ''" class="close-error">×</button>
    </div>

    <!-- 配置面板 -->
    <ConfigPanel
      ref="configPanel"
      v-model="showConfigPanel"
      :config="chatConfig"
      @config-change="handleConfigChange"
      @test-connection="handleTestConnection"
    />
  </div>
</template>

<style scoped>
.chat-container {
  width: 100%;
  max-width: 800px;
  height: 80vh;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.chat-header {
  background: linear-gradient(135deg, #59adf7 0%, #2e5ce6 100%);
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content {
  flex: 1;
}

.chat-header h1 {
  font-size: 1.5rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.chat-header p {
  opacity: 0.9;
  font-size: 0.9rem;
  margin: 0;
}

.config-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message {
  display: flex;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin: 0 12px;
  flex-shrink: 0;
}

.user-avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message.user .message-avatar.has-user-avatar {
  background: transparent; /* 有头像时移除背景 */
}

.message.assistant .message-avatar {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-content {
  max-width: 70%;
  background: #f8f9fa;
  border-radius: 18px;
  padding: 12px 16px;
  position: relative;
}

.message.user .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message-text {
  line-height: 1.5;
  word-wrap: break-word;
}

.message-text :deep(p) {
  margin: 0 0 8px 0;
}

.message-text :deep(p:last-child) {
  margin-bottom: 0;
}

.message-text :deep(ul) {
  margin: 8px 0;
  padding-left: 20px;
}

.message-text :deep(pre) {
  background: rgba(0, 0, 0, 0.1);
  padding: 8px;
  border-radius: 8px;
  margin: 8px 0;
  overflow-x: auto;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 4px;
  text-align: right;
}

.message.user .message-time {
  text-align: left;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

.chat-input {
  padding: 30px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  outline: none;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.send-button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 80px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.login-prompt {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #856404;
  font-size: 0.9rem;
}

.login-prompt .el-icon {
  color: #f39c12;
  font-size: 1.2rem;
}

.login-prompt span {
  flex: 1;
}

.login-prompt .el-button {
  border-radius: 16px;
  font-size: 0.875rem;
}

.chat-shortcuts {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  margin-right: 20px;
}

.chat-shortcuts .el-button {
  border-radius: 16px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.chat-shortcuts .el-button:hover {
  transform: translateY(-1px);
}

.connection-status {
  font-size: 0.875rem;
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 4px;
}

.connection-status.connected {
  color: #28a745;
}

.connection-status::before {
  content: '●';
  font-size: 0.75rem;
}

.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #dc3545;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  max-width: 80%;
}

.close-error {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-container {
    height: 100vh;
    border-radius: 0;
    max-width: none;
  }

  .message-content {
    max-width: 85%;
  }

  .chat-header h1 {
    font-size: 1.2rem;
  }

  .input-container {
    flex-direction: column;
    gap: 8px;
  }

  .message-input {
    width: 100%;
  }

  .send-button {
    width: 100%;
  }

  .chat-shortcuts {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    margin-right: 0;
  }

  .chat-shortcuts .el-button {
    width: 100%;
    justify-content: center;
  }

  .connection-status {
    align-self: center;
    margin-top: 4px;
  }
}
</style>
