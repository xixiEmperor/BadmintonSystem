/**
 * 自定义指令 - 权限控制
 * 用于控制元素的显示和隐藏，基于用户权限
 */
import { useUserStore } from '@/stores/modules/user'

// v-auth 自定义指令
export const auth = {
  // 在绑定元素的属性或事件监听器被应用之前调用
  mounted(el, binding) {
    // 获取用户信息
    const userStore = useUserStore()
    const userInfo = userStore.userinfo

    // 如果没有用户信息，则隐藏元素
    if (!userInfo) {
      el.style.display = 'none'
      return
    }

    // 获取当前用户昵称
    const currentUserNickname = userInfo.nickname

    // 传递的值为帖子或评论作者的昵称
    const authorNickname = binding.value

    // 比较当前用户是否是作者，如果不是则隐藏元素
    if (currentUserNickname !== authorNickname) {
      el.style.display = 'none'
    }
  },
  // 当指令所在组件更新时调用
  updated(el, binding) {
    // 获取用户信息
    const userStore = useUserStore()
    const userInfo = userStore.userinfo

    // 如果没有用户信息，则隐藏元素
    if (!userInfo) {
      el.style.display = 'none'
      return
    }

    // 获取当前用户昵称
    const currentUserNickname = userInfo.nickname

    // 传递的值为帖子或评论作者的昵称
    const authorNickname = binding.value

    // 比较当前用户是否是作者，如果不是则隐藏元素
    if (currentUserNickname !== authorNickname) {
      el.style.display = 'none'
    } else {
      el.style.display = ''
    }
  }
}

// 导出所有指令的集合
export default {
  auth
}
