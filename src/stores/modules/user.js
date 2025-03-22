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
      const res = await getUserInfoService(token.value)
      userinfo.value = res.data
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
      userinfo,
      token,
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
