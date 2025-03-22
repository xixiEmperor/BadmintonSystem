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
    const setUserinfo = () => {
      userinfo.value = {}
    }

    return {
      userinfo,
      token,
      getUserinfo,
      setUserinfo,
      setToken,
      removeToken,
    }
  },
  {
    persist: true,
  },
)
