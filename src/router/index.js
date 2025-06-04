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
          component: () => import('@/views/home/HomeView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/booking',
          component: () => import('@/views/booking/BookingView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/shop',
          component: () => import('@/views/shop/ShopView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/product/:id',
          component: () => import('@/views/shop/ProductDetail.vue'),
          meta: { title: '商品详情 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/cart',
          component: () => import('@/views/shop/CartView.vue'),
          meta: { requiresAuth: true, title: '购物车 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/checkout',
          component: () => import('@/views/shop/CheckoutView.vue'),
          meta: { requiresAuth: true, title: '结算 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/payment',
          component: () => import('@/views/pay/PaymentView.vue'),
          meta: { requiresAuth: true, title: '支付 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/payment-result',
          component: () => import('@/views/shop/PaymentResultView.vue'),
          meta: { requiresAuth: true, title: '支付结果 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/orders',
          component: () => import('@/views/shop/OrderListView.vue'),
          meta: { requiresAuth: true, title: '我的订单 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/order-detail/:orderNo',
          component: () => import('@/views/shop/OrderDetailView.vue'),
          meta: { requiresAuth: true, title: '订单详情 - 武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/forum',
          component: () => import('@/views/forum/ForumView.vue'),
          meta: { title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/user-center',
          component: () => import('@/views/userCenter/UserCenter.vue'),
          meta: { requiresAuth: true, title: '武汉理工大学南湖校区羽毛球场预定前台' },
        },
        {
          path: '/booking-history',
          component: () => import('@/views/booking/BookingHistory.vue'),
          meta: { requiresAuth: true, title: '预订记录 - 武汉理工大学南湖校区羽毛球场预定前台' },
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
        {
          path: '/my-history-post',
          component: () => import('@/views/forum/MyHistoryPost.vue'),
          meta: { requiresAuth: true, title: '我的发帖 - 武汉理工大学南湖校区羽毛球场预定前台' },
        }
      ],
    },
    // 后台管理系统路由
    {
      path: '/admin',
      component: () => import('@/views/admin/layout/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      meta: { requiresAdmin: true, title: '预订系统后台' },
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
        {
          path: 'forum',
          component: () => import('@/views/admin/ForumManagement.vue'),
          meta: { title: '论坛管理 - 预订系统后台' },
        },
        {
          path: 'forum/post/:id',
          component: () => import('@/views/admin/ForumPostDetail.vue'),
          meta: { title: '帖子详情 - 预订系统后台' },
        },
        {
          path: 'products',
          component: () => import('@/views/admin/shop/ProductManagement.vue'),
          meta: { title: '商品管理 - 预订系统后台' },
        },
        {
          path: 'orders',
          component: () => import('@/views/admin/shop/OrderManagement.vue'),
          meta: { title: '商品订单 - 预订系统后台' },
        },
        {
          path: 'venue-management',
          component: () => import('@/views/admin/VenueManagement.vue'),
          meta: { title: '场地管理 - 预订系统后台' },
        },
        {
          path: 'user-management',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: { title: '用户管理 - 预订系统后台' },
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
    // 检查是否有token且未过期
    if (userStore.token && !userStore.isTokenExpired()) {
      // 已登录且token有效，允许访问
      next()
    } else {
      // 未登录或token已过期，清除过期数据并跳转到登录页
      if (userStore.token && userStore.isTokenExpired()) {
        userStore.logout()
        ElMessage.warning('登录已过期，请重新登录')
      }
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else if (to.meta.requiresAdmin) {
    // 检查是否有token且未过期
    if (userStore.token && !userStore.isTokenExpired()) {
      // 判断是否为管理员
      if (userStore.userinfo?.role === 'ROLE_ADMIN') {
        next()
      } else {
        // 非管理员，跳转到首页
        ElMessage.error('您没有访问管理后台的权限')
        next('/')
      }
    } else {
      // 未登录或token已过期
      if (userStore.token && userStore.isTokenExpired()) {
        userStore.logout()
        ElMessage.warning('登录已过期，请重新登录')
      }
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }
  } else {
    // 不需要登录，直接放行
    // 但如果有token且已过期，也要清除
    if (userStore.token && userStore.isTokenExpired()) {
      userStore.logout()
    }
    next()
  }
})

export default router
