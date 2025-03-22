import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoService } from '@/api/user'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const setToken = (t) => {
      token.value = t
    }
    const removeToken = () => {
      token.value = ''
    }

    const userinfo = ref({})
    const getUserinfo = async () => {
      try {
        console.log('获取用户信息，当前token:', token.value)
        const res = await getUserInfoService(token.value)
        console.log('用户信息响应:', res)
        if (res.data) {
          userinfo.value = res.data
        } else {
          console.error('获取用户信息失败: 响应中没有data字段')
        }
      } catch (error) {
        console.error('获取用户信息出错:', error)
        throw error
      }
    }
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
    }
  },
  {
    persist: true,
  },
)
