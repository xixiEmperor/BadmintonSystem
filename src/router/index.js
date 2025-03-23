import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      // 页面懒加载
      component: () => import('@/views/layout/LayOut.vue'),
      // 重定向
      redirect: '/home',
      meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
      // 二级路由
      children: [
        {
          path: '/home',
          component: () => import('@/views/reception/HomeView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/booking',
          component: () => import('@/views/reception/BookingView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/shop',
          component: () => import('@/views/reception/ShopView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/cart',
          component: () => import('@/views/reception/CartView.vue'),
          meta: { requiresAuth: true, title: '购物车 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/forum',
          component: () => import('@/views/forum/ForumView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/user-center',
          component: () => import('@/views/reception/UserCenter.vue'),
          meta: { requiresAuth: true, title: '武汉理工大学南湖校区羽毛球场预定前台' }, // 需要登录才能访问
        },
        {
          path: '/publish-post',
          component: () => import('@/views/forum/PublishPost.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/post/:id',
          component: () => import('@/views/forum/PostDetail.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
      ],
    },
    // 后台管理系统路由
    {
      path: '/admin',
      component: () => import('@/views/admin/layout/AdminLayout.vue'),
      // meta: { requiresAdmin: true }, // 需要管理员权限
      redirect: '/admin/dashboard',
      meta: { title: '预订系统后台' },
      children: [
        {
          path: 'dashboard',
          component: () => import('@/views/admin/DashBoard.vue'),
          meta: { title: '预订系统后台' },
        },
        {
          path: 'booking-review',
          component: () => import('@/views/admin/BookingReview.vue'),
          meta: { title: '预订系统后台' },
        },
        {
          path: 'notice',
          component: () => import('@/views/admin/Notice.vue'),
          meta: { title: '预订系统后台' },
        },
      ],
    },
    {
      path: '/login',
      component: () => import('@/views/login/Login.vue'),
      meta: { title: '登录/注册' },
      children: [
        {
          path: 'forget-password',
          component: () => import('@/views/login/ForgetPassword.vue'),
          meta: { title: '找回密码' },
        },
      ],
    },
  ],
})

// 全局前置守卫，检查用户是否已登录
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 判断路由是否需要登录
  const userStore = useUserStore()
  if (to.meta.requiresAuth) {
    // 从 userStore 获取用户信息
    if (userStore.token) {
      // 已登录，允许访问
      next()
    } else {
      // 未登录，跳转到登录页
      next('/login')
    }
  } else if (to.meta.requiresAdmin) {
    // 判断是否为管理员
    if (userStore.userinfo.role === 'ROLE_ADMIN') {
      next()
    } else {
      // 非管理员，跳转到首页
      next('/')
    }
  } else {
    // 不需要登录，直接放行
    next()
  }
})

export default router
