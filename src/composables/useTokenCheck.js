import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'

/**
 * Token过期检查组合式函数
 * @param {Object} options 配置选项
 * @param {number} options.warningTime 提前警告时间（毫秒），默认30分钟
 * @param {number} options.checkInterval 检查间隔（毫秒），默认5分钟
 */
export function useTokenCheck(options = {}) {
  const {
    warningTime = 30 * 60 * 1000, // 30分钟
    checkInterval = 5 * 60 * 1000, // 5分钟
  } = options

  const userStore = useUserStore()
  const router = useRouter()
  const timer = ref(null)
  const hasWarned = ref(false)

  // 检查token状态
  const checkTokenStatus = () => {
    if (!userStore.token) {
      return
    }

    const remainingTime = userStore.getTokenRemainingTime()

    // 如果已经过期
    if (remainingTime <= 0) {
      handleTokenExpired()
      return
    }

    // 如果即将过期且还没有警告过
    if (remainingTime <= warningTime && !hasWarned.value) {
      showExpirationWarning(remainingTime)
      hasWarned.value = true
    }
  }

  // 处理token过期
  const handleTokenExpired = () => {
    stopTokenCheck()
    userStore.logout()
    ElMessage.warning('登录已过期，请重新登录')

    const currentPath = router.currentRoute.value.fullPath
    if (currentPath !== '/login') {
      router.push({
        path: '/login',
        query: { redirect: currentPath }
      })
    }
  }

  // 显示过期警告
  const showExpirationWarning = (remainingTime) => {
    const minutes = Math.floor(remainingTime / (60 * 1000))

    ElMessageBox.confirm(
      `您的登录状态将在 ${minutes} 分钟后过期，是否需要延长登录时间？`,
      '登录即将过期',
      {
        confirmButtonText: '延长登录',
        cancelButtonText: '稍后处理',
        type: 'warning',
      }
    ).then(() => {
      // 用户选择延长登录，可以在这里调用刷新token的接口
      // 或者跳转到登录页面重新登录
      refreshLogin()
    }).catch(() => {
      // 用户选择稍后处理，不做任何操作
      ElMessage.info('请注意登录状态，避免操作中断')
    })
  }

  // 刷新登录状态
  const refreshLogin = () => {
    const currentPath = router.currentRoute.value.fullPath
    router.push({
      path: '/login',
      query: {
        redirect: currentPath,
        refresh: 'true' // 标记这是一个刷新登录
      }
    })
  }

  // 开始token检查
  const startTokenCheck = () => {
    if (timer.value) {
      clearInterval(timer.value)
    }

    // 立即检查一次
    checkTokenStatus()

    // 设置定时检查
    timer.value = setInterval(checkTokenStatus, checkInterval)
  }

  // 停止token检查
  const stopTokenCheck = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
    hasWarned.value = false
  }

  // 组件挂载时开始检查
  onMounted(() => {
    if (userStore.token) {
      startTokenCheck()
    }
  })

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopTokenCheck()
  })

  return {
    startTokenCheck,
    stopTokenCheck,
    checkTokenStatus,
  }
}
