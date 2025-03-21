import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      // 页面懒加载
      component: () => import('@/views/layout/index.vue'),
      // 重定向
      redirect: '/home',
      // 二级路由
      children: [
        {
          path: '/home',
          component: () => import('@/views/reception/HomeView.vue'),
        },
        {
          path: '/booking',
          component: () => import('@/views/reception/BookingView.vue'),
        },
        {
          path: '/shop',
          component: () => import('@/views/reception/ShopView.vue'),
        },
        {
          path: '/forum',
          component: () => import('@/views/forum/ForumView.vue'),
        },
        {
          path: '/user-center',
          component: () => import('@/views/reception/UserCenter.vue'),
          meta: { requiresAuth: true }, // 需要登录才能访问
        },
        {
          path: '/publish-post',
          component: () => import('@/views/forum/PublishPost.vue'),
        },
        {
          path: '/post/:id',
          component: () => import('@/views/forum/PostDetail.vue'),
        },
      ],
    },
    // 后台管理系统路由
    {
      path: '/admin',
      component: () => import('@/views/admin/layout/AdminLayout.vue'),
      // meta: { requiresAdmin: true }, // 需要管理员权限
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '首页' },
        },
        {
          path: 'booking-review',
          component: () => import('@/views/admin/BookingReview.vue'),
          meta: { title: '预定审核' },
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/login/Login.vue'),
    },
  ],
})

// 全局前置守卫，检查用户是否已登录
router.beforeEach((to, from, next) => {
  // 判断路由是否需要登录
  if (to.meta.requiresAuth) {
    // 从 localStorage 获取用户信息
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  } else if (to.meta.requiresAdmin) {
    // 判断是否为管理员
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      // 这里应该根据实际情况判断是否为管理员，暂时简化处理
      if (user.isAdmin) {
        next()
      } else {
        // 非管理员，跳转到首页
        next('/')
      }
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  } else {
    // 不需要登录，直接放行
    next()
  }
})

export default router
