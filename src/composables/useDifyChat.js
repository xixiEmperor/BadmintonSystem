import { ref } from 'vue'

// Dify API配置
const API_BASE_URL = '/v1'
const API_KEY = 'app-zV1H0vnzPlwjUkkexGCmF5Gn' // 从app.md获取的API KEY

export function useDifyChat() {
  const conversationId = ref('')
  const isConnected = ref(false)

  /**
   * 发送聊天消息到Dify API
   * @param {string} query - 用户输入的查询
   * @param {function} onMessage - 处理流式消息的回调函数
   * @param {object} options - 可选配置
   */
  const sendChatMessage = async (query, onMessage, options = {}) => {
    try {
      const requestBody = {
        query,
        response_mode: 'streaming',
        conversation_id: conversationId.value,
        user: options.user || 'user1',
        inputs: options.inputs || {},
        files: options.files || [],
        auto_generate_name: options.auto_generate_name !== false
      }

      console.log('发送请求到Dify API:', requestBody)

      const response = await fetch(`${API_BASE_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      isConnected.value = true

      // 处理流式响应
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          console.log('流式响应结束')
          break
        }

        // 解码数据块
        const chunk = decoder.decode(value, { stream: true })

        // 处理多个数据行
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.trim() === '') continue

          // 解析Server-Sent Events格式
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6) // 移除 "data: " 前缀

              // 跳过非JSON数据（如ping事件）
              if (jsonStr.trim() === '' || jsonStr.includes('[DONE]')) {
                continue
              }

              const data = JSON.parse(jsonStr)
              console.log('收到数据块:', data)

              // 更新conversation_id
              if (data.conversation_id && !conversationId.value) {
                conversationId.value = data.conversation_id
                console.log('设置conversation_id:', conversationId.value)
              }

              // 调用消息处理回调
              if (onMessage && typeof onMessage === 'function') {
                onMessage(data)
              }

              // 处理不同类型的事件
              switch (data.event) {
                case 'workflow_started':
                  console.log('工作流开始:', data.data)
                  break

                case 'node_started':
                  console.log('节点开始执行:', data.data.title)
                  break

                case 'node_finished':
                  console.log('节点执行完成:', data.data.title, data.data.status)
                  break

                case 'workflow_finished':
                  console.log('工作流完成:', data.data.status)
                  break

                case 'message':
                  // 流式文本消息
                  break

                case 'message_end':
                  console.log('消息结束，使用情况:', data.metadata?.usage)
                  break

                case 'error':
                  console.error('收到错误事件:', data)
                  throw new Error(data.message || '未知错误')

                default:
                  console.log('未处理的事件类型:', data.event)
              }

            } catch (parseError) {
              console.warn('解析数据块失败:', parseError, '原始数据:', jsonStr)
            }
          }
        }
      }

    } catch (error) {
      console.error('发送聊天消息失败:', error)
      isConnected.value = false
      throw error
    }
  }

  /**
   * 重置会话
   */
  const resetConversation = () => {
    conversationId.value = ''
    console.log('会话已重置')
  }

  /**
   * 获取当前会话ID
   */
  const getCurrentConversationId = () => {
    return conversationId.value
  }

  return {
    sendChatMessage,
    resetConversation,
    getCurrentConversationId,
    conversationId: conversationId.value,
    isConnected
  }
}