<script setup>
import { Sender } from 'vue-element-plus-x'
import { BubbleList } from 'vue-element-plus-x'
import { ref, defineProps, defineEmits, watch, onMounted } from 'vue'
import { DocumentCopy, Refresh, Search, Close, Minus, FullScreen } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 定义props和emits
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:visible'])

// 监听visible变化
watch(
  () => props.visible,
  (newVal) => {
    console.log('AiChatDialog visible changed:', newVal)
  },
)

// 关闭对话框
const closeDialog = () => {
  console.log('关闭对话框，发出update:visible事件，值为false')
  emits('update:visible', false)
}

// 最小化对话框
const isMinimized = ref(false)
const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}

// 拖拽相关
const dialogRef = ref(null)
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

// 初始化拖拽
const initDrag = () => {
  const header = dialogRef.value?.querySelector('.dialog-header')
  if (!header) return

  header.addEventListener('mousedown', startDrag)
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

// 开始拖拽
const startDrag = (e) => {
  if (!dialogRef.value) return
  isDragging.value = true

  const rect = dialogRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

// 拖拽过程
const onDrag = (e) => {
  if (!isDragging.value || !dialogRef.value) return

  const newX = e.clientX - dragOffset.value.x
  const newY = e.clientY - dragOffset.value.y

  dialogRef.value.style.left = `${newX}px`
  dialogRef.value.style.top = `${newY}px`
  dialogRef.value.style.right = 'auto'
  dialogRef.value.style.bottom = 'auto'
}

// 停止拖拽
const stopDrag = () => {
  isDragging.value = false
}

// 组件挂载后初始化拖拽
onMounted(() => {
  initDrag()
})

// 发送框部分
const senderRef = ref()
const senderValue = ref()
const senderLoading = ref(false)
const timer = ref(null)

// 用户点击发送的处理逻辑
const handleSubmit = (value) => {
  ElMessage.info('发送中...')
  senderLoading.value = true
  timer.value = setTimeout(() => {
    console.log(value)
    console.log(senderValue.value)
    senderLoading.value = false
    // 向消息框中添加用户发送的消息
    // TODO 实际开发中应该向后端发送请求，将数据保存在数据库中
    list.value.push({
      role: 'user',
      placement: 'end',
      content: senderValue.value,
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      avatarSize: '45px',
    })
    ElMessage.success('发送成功')
    senderValue.value = ''

    // 模拟AI回复
    setTimeout(() => {
      list.value.push({
        role: 'ai',
        placement: 'start',
        content: '我已收到您的消息，正在处理中...',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        avatarSize: '45px',
      })
    }, 1000)
  }, 1000)

  // 用户发送完之后，向后端发送请求，从本地知识库中获取答案
  // 得到答案添加到list中之后，再次保存到数据库中
  // 注意使用异步组件async，await
}

// 取消发送处理逻辑
const handleCancel = () => {
  senderLoading.value = false
  if (senderValue.value) clearTimeout(timer.value)
  timer.value = null
  ElMessage.info(`取消发送`)
}

// 刷新处理逻辑
const handleRefresh = () => {
  // 1. 只有最后一条ai信息可以进行刷新
  // 2. 先发送请求删除该条信息
  // 3. 再发送获取答案请求重新获取并存储，渲染
  if (list.value.length > 0 && list.value[list.value.length - 1].role === 'ai') {
    list.value.pop()
    ElMessage.success('刷新成功')

    // 模拟重新获取答案
    setTimeout(() => {
      list.value.push({
        role: 'ai',
        placement: 'start',
        content: '这是刷新后的回答，希望能够帮到您！',
        avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
        avatarSize: '45px',
      })
    }, 1000)
  } else {
    ElMessage.warning('只能刷新最后一条AI回复')
  }
}

// 复制内容
const handleCopy = () => {
  if (list.value.length > 0) {
    const lastMessage = list.value[list.value.length - 1].content
    navigator.clipboard
      .writeText(lastMessage)
      .then(() => {
        ElMessage.success('复制成功')
      })
      .catch(() => {
        ElMessage.error('复制失败')
      })
  }
}

// 消息框部分
const list = ref([
  {
    role: 'ai',
    placement: 'start',
    content: '你好，我是小助手，请问有什么可以帮助你的吗？',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    avatarSize: '45px',
  },
])
</script>

<template>
  <div class="ai-chat-dialog" v-if="visible">
    <div class="dialog-wrapper" ref="dialogRef" :class="{ minimized: isMinimized }">
      <div class="dialog-header">
        <div class="dialog-title">AI智能助手</div>
        <div class="dialog-controls">
          <el-button type="text" class="minimize-btn" @click="toggleMinimize">
            <el-icon v-if="!isMinimized"><Minus /></el-icon>
            <el-icon v-else><FullScreen /></el-icon>
          </el-button>
          <el-button type="text" class="close-btn" @click="closeDialog">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>
      </div>

      <div class="dialog-content" v-show="!isMinimized">
        <div class="messagebox">
          <BubbleList :list="list" max-height="550px">
            <!-- 自定义底部 -->
            <template #footer>
              <div class="footer-wrapper">
                <div class="footer-container">
                  <el-tooltip content="刷新最后一条回复" placement="top">
                    <el-button
                      type="info"
                      :icon="Refresh"
                      size="small"
                      circle
                      @click="handleRefresh"
                    />
                  </el-tooltip>
                  <el-tooltip content="搜索内容" placement="top">
                    <el-button type="success" :icon="Search" size="small" circle />
                  </el-tooltip>
                  <el-tooltip content="复制内容" placement="top">
                    <el-button
                      color="#626aef"
                      :icon="DocumentCopy"
                      size="small"
                      circle
                      @click="handleCopy"
                    />
                  </el-tooltip>
                </div>
              </div>
            </template>
          </BubbleList>
        </div>

        <Sender
          class="sender"
          ref="senderRef"
          v-model="senderValue"
          submit-type="enter"
          clearable="true"
          placeholder="请输入您的问题..."
          inputWidth="100%"
          :loading="senderLoading"
          @cancel="handleCancel"
          @submit="handleSubmit"
        ></Sender>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ai-chat-dialog {
  position: fixed;
  right: 30px;
  bottom: 120px;
  z-index: 9999;
  display: flex;
  pointer-events: none; /* 确保点击事件不被空白区域拦截 */

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    right: 20px;
    width: 20px;
    height: 20px;
    background-color: #fff;
    transform: rotate(45deg);
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1);
    z-index: -1;
    display: none;
  }

  .dialog-wrapper {
    pointer-events: auto; /* 恢复对话框内容的点击事件 */
    width: 450px;
    height: 650px;
    background-color: #fff;
    border-radius: 15px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    transform-origin: bottom right;
    transition: all 0.3s ease;
    animation: float 3s ease-in-out infinite;

    &.minimized {
      height: 60px;
      width: 280px;
      border-radius: 30px;
      transition: all 0.3s ease;
      animation: none;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);

      .dialog-header {
        box-shadow: none;
      }
    }

    .dialog-header {
      height: 60px;
      background-color: #296cb6;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      cursor: move; /* 可拖动提示 */
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .dialog-title {
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 1px;
      }

      .dialog-controls {
        display: flex;
        align-items: center;

        .minimize-btn,
        .close-btn {
          color: #fff;
          font-size: 22px;
          margin-left: 15px;
          transition: all 0.2s ease;

          &:hover {
            color: #ffd04b;
            transform: scale(1.1);
          }
        }
      }
    }

    .dialog-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 15px;

      .messagebox {
        flex: 1;
        overflow: hidden;
        margin-bottom: 15px;

        .footer-wrapper {
          display: flex;
          justify-content: center;
          margin-top: 10px;

          .footer-container {
            display: flex;
            gap: 10px;
          }
        }

        /* 添加气泡样式 */
        :deep(.bubble-list) {
          padding: 12px;

          .bubble-item {
            margin-bottom: 18px;
            display: flex;

            &.ai {
              justify-content: flex-start;

              .content {
                background-color: #f5f5f5;
                border-radius: 10px 10px 10px 0;
                font-size: 16px;
              }
            }

            &.user {
              justify-content: flex-end;

              .content {
                background-color: #296cb6;
                color: white;
                border-radius: 10px 10px 0 10px;
                font-size: 16px;
              }
            }

            .avatar {
              margin: 0 12px;
              img {
                width: 50px !important;
                height: 50px !important;
                border-radius: 50%;
              }
            }

            .content {
              padding: 12px 18px;
              max-width: 80%;
              word-break: break-all;
              line-height: 1.5;
            }
          }
        }
      }

      .sender {
        height: 60px;
        border-radius: 10px;
        background-color: #f7f7f7;
        margin-top: 5px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        :deep(.el-input__wrapper) {
          background-color: #f7f7f7;
          padding: 8px 15px;

          .el-input__inner {
            font-size: 16px;
          }
        }

        :deep(.el-input-group__append) {
          .el-button {
            font-size: 16px;
            padding: 12px 20px;
          }
        }
      }
    }
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
  100% {
    transform: translateY(0px);
  }
}
</style>
