// Dify API 连接测试脚本
const API_BASE_URL = 'http://127.0.0.1/v1'
const API_KEY = 'app-zV1H0vnzPlwjUkkexGCmF5Gn'

async function testDifyConnection() {
  console.log('🧪 开始测试 Dify API 连接...')

  const requestBody = {
    query: '你好',
    response_mode: 'streaming',
    conversation_id: '',
    user: 'test-user',
    inputs: {},
    files: []
  }

  try {
    console.log('📤 发送请求:', requestBody)

    const response = await fetch(`${API_BASE_URL}/chat-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📡 响应状态:', response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    console.log('✅ API 连接成功！')
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()))

    // 读取流式响应
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let messageCount = 0

    console.log('📄 开始读取流式响应...')

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        console.log('🏁 流式响应结束')
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.trim() === '') continue

        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.substring(6)
            if (jsonStr.trim() === '' || jsonStr.includes('[DONE]')) {
              continue
            }

            const data = JSON.parse(jsonStr)
            messageCount++

            console.log(`📨 消息 ${messageCount}:`, {
              event: data.event,
              content: data.answer ? data.answer.substring(0, 50) + '...' : '',
              conversation_id: data.conversation_id
            })

          } catch (parseError) {
            console.warn('⚠️ 解析数据块失败:', parseError.message)
          }
        }
      }
    }

    console.log(`🎉 测试完成！共收到 ${messageCount} 条消息`)

  } catch (error) {
    console.error('❌ 测试失败:', error.message)

    if (error.message.includes('fetch')) {
      console.log('💡 建议检查：')
      console.log('   1. Dify 服务是否正在运行 (http://127.0.0.1)')
      console.log('   2. API Key 是否正确')
      console.log('   3. 网络连接是否正常')
    }
  }
}

// 运行测试
if (typeof module !== 'undefined' && module.exports) {
  // Node.js 环境
  module.exports = { testDifyConnection }
} else {
  // 浏览器环境
  testDifyConnection()
}
