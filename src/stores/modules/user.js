import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoService } from '@/api/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const tokenExpireTime = ref(null)

    // 设置token
    const setToken = (t, expireTime = null) => {
      token.value = t
      if (expireTime) {
        tokenExpireTime.value = expireTime
      } else {
        tokenExpireTime.value = Date.now() + 24 * 60 * 60 * 1000
      }
      localStorage.setItem('token', t)
      localStorage.setItem('tokenExpireTime', tokenExpireTime.value.toString())
    }

    // 检查token是否过期
    const isTokenExpired = () => {
      if (!token.value || !tokenExpireTime.value) {
        return true
      }
      return Date.now() > tokenExpireTime.value
    }

    // 获取token剩余有效时间（毫秒）
    const getTokenRemainingTime = () => {
      if (!tokenExpireTime.value) {
        return 0
      }
      const remaining = tokenExpireTime.value - Date.now()
      return remaining > 0 ? remaining : 0
    }

    // 移除token
    const removeToken = () => {
      token.value = ''
      tokenExpireTime.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpireTime')
    }

    // 获取用户信息
    const userinfo = ref()
    const getUserinfo = async () => {
      if (isTokenExpired()) {
        logout()
        throw new Error('Token已过期，请重新登录')
      }

      try {
        const res = await getUserInfoService(token.value)
        if (res.data) {
          userinfo.value = res.data.data
        } else {
          console.error('获取用户信息失败: 响应中没有data字段')
        }
      } catch (error) {
        console.error('获取用户信息出错:', error)
        if (error.response?.status === 401) {
          logout()
        }
        throw error
      }
    }

    // 设置用户信息
    const setUserinfo = (info) => {
      userinfo.value = info
    }

    // 清除用户信息
    const clearUserinfo = () => {
      userinfo.value = {}
    }

    // 登出方法，一次性清除所有状态
    const logout = () => {
      token.value = ''
      tokenExpireTime.value = null
      userinfo.value = {}
      localStorage.removeItem('token')
      localStorage.removeItem('tokenExpireTime')
    }

    // 初始化时从localStorage恢复token和过期时间
    const initializeFromStorage = () => {
      const storedToken = localStorage.getItem('token')
      const storedExpireTime = localStorage.getItem('tokenExpireTime')

      if (storedToken && storedExpireTime) {
        token.value = storedToken
        tokenExpireTime.value = parseInt(storedExpireTime)

        if (isTokenExpired()) {
          logout()
        }
      }
    }

    initializeFromStorage()

    return {
      token,
      tokenExpireTime,
      userinfo,
      getUserinfo,
      clearUserinfo,
      setToken,
      removeToken,
      logout,
      setUserinfo,
      isTokenExpired,
      getTokenRemainingTime,
      initializeFromStorage,
    }
  },
  {
    persist: true,
  },
)
