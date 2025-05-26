<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, Calendar, ArrowDown, Notification, ChatDotRound, GoodsFilled, ShoppingBag, ShoppingCart } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 计算当前激活的菜单项
const activeMenu = computed(() => {
  return route.path
})

// 计算当前页面标题
const currentTitle = computed(() => {
  return route.meta.title || '管理后台'
})

// 退出登录
const logout = () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('token')
  ElMessage.success('退出登录成功')
  // 使用新标签页打开登录页
  const routeUrl = router.resolve('/login')
  window.open(routeUrl.href, '_blank')
  // 关闭当前页面
  window.close()
}
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边菜单栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>羽毛球场地管理系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><HomeFilled /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-sub-menu index="venue-management">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>场地相关</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/admin/venue-management">
              <el-icon><Calendar /></el-icon>
              <span>场地管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/booking-review">
              <el-icon><Calendar /></el-icon>
              <span>预定管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/notice">
              <el-icon><Notification /></el-icon>
              <span>发布通知</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
        <el-menu-item index="/admin/forum">
          <el-icon><ChatDotRound /></el-icon>
          <span>论坛管理</span>
        </el-menu-item>
        <el-sub-menu index="mall-management">
          <template #title>
            <el-icon><ShoppingCart /></el-icon>
            <span>商城相关</span>
          </template>
          <el-menu-item-group>
            <el-menu-item index="/admin/products">
              <el-icon><GoodsFilled /></el-icon>
              <span>商品管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/orders">
              <el-icon><ShoppingBag /></el-icon>
              <span>商品订单</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-content">
      <!-- 顶部导航 -->
      <div class="header">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">后台管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="user-info">
          <el-dropdown>
            <span class="el-dropdown-link">
              管理员 <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 页面内容 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .sidebar {
    width: 220px;
    background-color: #001529;
    color: #fff;
    height: 100%;
    overflow-y: auto;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      h2 {
        color: #fff;
        font-size: 16px;
        margin: 0;
        padding: 0 16px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .el-menu {
      border-right: none;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      height: 60px;
      background-color: #fff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .breadcrumb {
        display: flex;
        align-items: center;
      }

      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;

        .el-dropdown-link {
          display: flex;
          align-items: center;
        }
      }
    }

    .content {
      flex: 1;
      overflow: auto;
      padding: 20px;
      background-color: #f0f2f5;
    }
  }
}
</style>
