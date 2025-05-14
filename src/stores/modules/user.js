import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoService } from '@/api/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    // 设置token
    const setToken = (t) => {
      token.value = t
    }
    // 移除token
    const removeToken = () => {
      token.value = ''
    }
    // 获取用户信息
    const userinfo = ref()
    const getUserinfo = async () => {
      try {
        const res = await getUserInfoService(token.value)
        if (res.data) {
          userinfo.value = res.data.data
        } else {
          console.error('获取用户信息失败: 响应中没有data字段')
        }
      } catch (error) {
        console.error('获取用户信息出错:', error)
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
      userinfo.value = {}
      localStorage.removeItem('token')
    }

    return {
      token,
      userinfo,
      getUserinfo,
      clearUserinfo,
      setToken,
      removeToken,
      logout,
      setUserinfo,
    }
  },
  {
    persist: true,
  },
)
