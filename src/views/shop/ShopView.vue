<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CategoryList from './components/CategoryList.vue'
import ProductList from './components/ProductList.vue'
import ProductCarousel from './components/ProductCarousel.vue'

// 选中的分类
const selectedCategory = ref('all')

// 响应式检测
const isMobile = ref(false)

// 检测屏幕尺寸
const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

// 防抖函数
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// 防抖处理的resize检查
const debouncedCheckScreenSize = debounce(checkScreenSize, 150)

// 处理分类选择
const handleCategoryChange = (categoryId) => {
  selectedCategory.value = categoryId
}

// 组件挂载时检测屏幕尺寸并添加监听器
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', debouncedCheckScreenSize)
})

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', debouncedCheckScreenSize)
})
</script>

<template>
  <div class="shop-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">羽体商城</h1>
      <p class="page-subtitle">专业羽毛球装备，助力你的运动表现</p>
    </div>

    <!-- 商品推荐轮播图 -->
    <ProductCarousel />

    <!-- 桌面端布局 -->
    <el-container class="desktop-layout" v-if="!isMobile">
      <el-aside width="240px" class="sidebar">
        <!-- 商品分类导航 -->
        <div class="category-section">
          <CategoryList @category-selected="handleCategoryChange" />
        </div>
      </el-aside>
      <el-main class="main-content">
        <!-- 商品列表 -->
        <ProductList :categoryId="selectedCategory" />
      </el-main>
    </el-container>

    <!-- 移动端布局 -->
    <div class="mobile-layout" v-if="isMobile">
      <!-- 移动端分类导航 -->
      <div class="mobile-category">
        <CategoryList @category-selected="handleCategoryChange" />
      </div>
      <!-- 移动端商品列表 -->
      <div class="mobile-products">
        <ProductList :categoryId="selectedCategory" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.shop-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  /* 启用硬件加速 */
  transform: translateZ(0);
  will-change: auto;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 10px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

/* 桌面端布局 */
.desktop-layout {
  display: flex;
  gap: 24px;
  background: transparent;
}

.sidebar {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.main-content {
  padding: 0;
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.category-section {
  margin-bottom: 0;
}

/* 移动端布局 */
.mobile-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-category {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.mobile-products {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 响应式媒体查询 */
@media (max-width: 768px) {
  .shop-container {
    padding: 12px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .page-header {
    padding: 20px 16px;
    margin-bottom: 20px;
    border-radius: 12px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .page-subtitle {
    font-size: 14px;
  }

  .mobile-category,
  .mobile-products {
    padding: 12px;
    border-radius: 8px;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .shop-container {
    padding: 8px;
  }

  .page-header {
    padding: 16px 12px;
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .page-subtitle {
    font-size: 12px;
  }

  .mobile-category,
  .mobile-products {
    padding: 12px;
    border-radius: 8px;
  }
}

/* 全局样式优化 */
:deep(.el-aside) {
  background: transparent !important;
}

:deep(.el-main) {
  background: transparent !important;
}

/* 优化动画效果 */
.sidebar,
.main-content,
.mobile-category,
.mobile-products {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  /* 启用硬件加速 */
  transform: translateZ(0);
  will-change: transform, box-shadow;
}

.sidebar:hover,
.main-content:hover,
.mobile-category:hover,
.mobile-products:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
</style>
