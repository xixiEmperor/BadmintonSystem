<script setup>
import { ref, onMounted, computed } from 'vue'
import { Plus, ArrowDown, User, ShoppingCart } from '@element-plus/icons-vue'
import AIChatDialog from '@/components/AiChatDialog.vue'
import { useUserStore, useCartStore } from '@/stores'
import { useRouter } from 'vue-router'
import { navigate } from '@/utils/router'
import { ElMessageBox } from 'element-plus'

// 路由
const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

// 获取购物车商品数量
const cartItemCount = computed(() => {
  return cartStore.totalItems()
})

// AI助手对话框控制
const showAIChat = ref(false)

const toggleAIChat = () => {
  showAIChat.value = !showAIChat.value
}

// 用户相关
const isLogin = ref(false)
const userInfo = ref({})
userInfo.value = userStore.userinfo

// 检查登录状态
const checkLogin = () => {
  // TODO: 调用API验证用户登录状态
  if (userStore.token) {
    try {
      isLogin.value = true
    } catch (e) {
      console.error('解析用户信息失败', e)
      isLogin.value = false
    }
  }
}

// 跳转到个人中心
const goToUserCenter = () => {
  router.push('/user-center')
}

// 跳转到登录页面
const goToLogin = () => {
  navigate('/login')
}

// 跳转到购物车页面
const goToCart = () => {
  router.push('/cart')
}

// 退出登录
const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 使用store的logout方法统一处理登出逻辑
    userStore.logout()
    isLogin.value = false
    userInfo.value = {
      username: '',
      avatar: '',
    }
    // 如果当前在个人中心页面，退出登录后跳转到首页
    if (router.currentRoute.value.path === '/user-center') {
      router.push('/')
    }
  })
}

// 组件挂载时检查登录状态
onMounted(() => {
  checkLogin()
})
</script>

<template>
  <el-container>
    <el-header class="header">
      <div class="header__content">
        <div class="container">
          <div class="header__logo">
            <img src="../../assets/whlg_logo.png" alt="" />
            <p>南湖校区羽毛球场地预定</p>
          </div>

          <!-- 用户信息区域 -->
          <div class="user-area">
            <!-- 购物车入口 -->
            <el-button v-if="isLogin" type="text" class="cart-btn" @click="goToCart">
              <el-badge :value="cartItemCount" :hidden="cartItemCount === 0">
                <el-icon><ShoppingCart /></el-icon>
              </el-badge>
              <span>购物车</span>
            </el-button>

            <!-- 个人中心入口 -->
            <el-button v-if="isLogin" type="text" class="user-center-btn" @click="goToUserCenter">
              <el-icon><User /></el-icon>
              <span>个人中心</span>
            </el-button>

            <!-- 登录后显示用户信息 -->
            <div v-if="isLogin" class="user-info">
              <div class="user-avatar">
                <img v-if="userInfo.avatar" :src="userInfo.avatar" alt="头像" />
                <img
                  v-else
                  src="https://tse1-mm.cn.bing.net/th/id/OIP-C.gaAkkFf8LStn-oc4l8iM0wAAAA?w=160&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7"
                  alt="默认头像"
                />
              </div>
              <span class="username">{{ userInfo.username }}</span>
              <el-dropdown trigger="click">
                <span class="el-dropdown-link">
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToUserCenter">个人中心</el-dropdown-item>
                    <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>

            <!-- 未登录显示登录/注册按钮 -->
            <el-button v-else type="primary" size="large" class="login" @click="goToLogin">
              登录 / 注册
            </el-button>
          </div>
        </div>
        <div class="nav">
          <div class="container">
            <el-menu
              :default-active="$route.path"
              class="el-menu-demo"
              mode="horizontal"
              background-color="rgb(41, 108, 182)"
              text-color="#fff"
              active-text-color="#ffd04b"
            >
              <el-menu-item index="/home">
                <router-link to="/home">首页</router-link>
              </el-menu-item>
              <el-menu-item index="/booking">
                <router-link to="/booking">场地预定</router-link>
              </el-menu-item>
              <el-menu-item index="/shop">
                <router-link to="/shop">羽体商城</router-link>
              </el-menu-item>
              <el-menu-item index="/forum">
                <router-link to="/forum">羽你同行论坛</router-link>
              </el-menu-item>
            </el-menu>
          </div>
        </div>
      </div>
    </el-header>

    <el-main>
      <router-view></router-view>
    </el-main>
    <el-footer>
      <!-- 页脚 -->
      <div class="footer">
        <div class="container">
          <p>版权所有 © 2025 南湖校区羽毛球场预定系统</p>
          <p>联系电话: 12345678901 | 地址: 南湖校区体育中心一楼</p>
        </div>
      </div>

      <!-- AI助手悬浮按钮 -->
      <div class="ai-assistant">
        <el-button
          type="primary"
          circle
          :icon="Plus"
          class="ai-btn"
          @click="toggleAIChat"
        ></el-button>
      </div>

      <!-- AI助手对话框 -->
      <AIChatDialog v-model:visible="showAIChat" />
    </el-footer>
  </el-container>
</template>

<style lang="less" scoped>
.header {
  width: 100%;
  height: 200px;
  background-color: rgb(50, 114, 185);
  box-sizing: border-box;
  overflow: hidden;
  .header__content {
    display: flex;
    flex-direction: column;
    @media (max-width: 1200px) {
      .container {
        width: 100%;
        padding: 0 20px;
      }
      .header__logo img {
        width: 200px;
        height: auto;
      }
      .header__logo p {
        font-size: 18px;
      }
      .login {
        font-size: 16px;
      }
    }
    @media (max-width: 768px) {
      .container {
        flex-direction: column;
        align-items: flex-start;
      }
      .header__logo {
        margin-bottom: 10px;
      }
      .login {
        align-self: flex-end;
      }
    }
  }
  .container {
    display: flex;
    align-items: center;
    margin: 20px auto;
    width: 1200px;
    height: 80px;
    .header__logo {
      display: flex;
      align-items: center;
      img {
        width: 320px;
        height: 64px;
      }
      p {
        color: #fff;
        font-size: 24px;
        margin-left: 20px;
      }
    }
    .user-area {
      margin-left: auto;
      display: flex;
      align-items: center;

      .cart-btn,
      .user-center-btn {
        color: #fff;
        font-size: 16px;
        margin-right: 20px;
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 5px;
          font-size: 18px;
        }

        &:hover {
          color: #ffd04b;
        }
      }

      .user-info {
        display: flex;
        align-items: center;

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
          margin-right: 10px;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .username {
          color: #fff;
          font-size: 16px;
          margin-right: 5px;
        }

        .el-dropdown-link {
          cursor: pointer;
          color: #fff;
          display: flex;
          align-items: center;

          &:hover {
            color: #ffd04b;
          }
        }
      }

      .login {
        background-color: rgb(50, 114, 185);
        border: none;
        font-size: 18px;
      }
    }
  }
}

.nav {
  .container {
    display: flex;
    justify-content: center;
    margin: 0 auto;
    .el-menu-demo {
      width: 100%;
      background-color: rgb(50, 114, 185);
      display: flex;
      justify-content: space-evenly;
      border-bottom: none;
      .el-sub-menu {
        width: 200px;
        text-align: center;
        .el-menu-item {
          width: 200px;
        }
      }
      .el-menu-item {
        width: 200px;
        text-align: center;
        a {
          text-align: center;
        }
      }

      a {
        text-decoration: none;
        color: #fff;
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }
      .router-link-active {
        color: #ffd04b; // 修改激活状态的文字颜色

        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          background-color: #ffd04b; // 修改底部边框颜色
        }
      }
    }
  }
}
/* 页脚样式 */
.footer {
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  text-align: center;
}

/* AI助手按钮样式 */
.ai-assistant {
  position: fixed;
  right: 50px;
  bottom: 50px;
  z-index: 1000;
}
.ai-btn {
  width: 60px;
  height: 60px;
  font-size: 24px;
}
</style>
