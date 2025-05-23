<script setup>
import { ref } from 'vue'
import CategoryList from './components/CategoryList.vue'
import ProductList from './components/ProductList.vue'

// 选中的分类
const selectedCategory = ref('all')

// 处理分类选择
const handleCategoryChange = (categoryId) => {
  selectedCategory.value = categoryId
}
</script>

<template>
  <div class="shop-container">
    <h2>羽体商城</h2>

    <!-- 桌面端布局 -->
    <el-container class="desktop-layout">
      <el-aside width="220px">
        <!-- 商品分类导航 -->
        <CategoryList @category-selected="handleCategoryChange" />
      </el-aside>
      <el-main>
        <!-- 商品列表 -->
        <ProductList :categoryId="selectedCategory" />
      </el-main>
    </el-container>

    <!-- 移动端布局 -->
    <div class="mobile-layout">
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.shop-container h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

/* 桌面端布局 */
.desktop-layout {
  display: flex;
}

.el-aside {
  background-color: #fff;
  margin-right: 20px;
  border-radius: 4px;
  padding: 15px;
}

.el-main {
  padding: 0;
  flex: 1;
}

/* 移动端布局 */
.mobile-layout {
  display: none;
  flex-direction: column;
}

.mobile-category {
  background-color: #fff;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}

.mobile-products {
  flex: 1;
}

/* 响应式媒体查询 */
@media (max-width: 768px) {
  .shop-container {
    padding: 10px;
  }

  .shop-container h2 {
    font-size: 20px;
    margin-bottom: 15px;
    text-align: center;
  }

  /* 隐藏桌面端布局 */
  .desktop-layout {
    display: none;
  }

  /* 显示移动端布局 */
  .mobile-layout {
    display: flex;
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .shop-container {
    padding: 5px;
  }

  .shop-container h2 {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .mobile-category {
    padding: 10px;
    margin-bottom: 10px;
  }
}
</style>
