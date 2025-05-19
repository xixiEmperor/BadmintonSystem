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

    <el-container>
      <el-aside width="220px">
        <!-- 商品分类导航 -->
        <CategoryList @category-selected="handleCategoryChange" />
      </el-aside>
      <el-main>
        <!-- 商品列表 -->
        <ProductList :categoryId="selectedCategory" />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.shop-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.el-aside {
  background-color: #fff;
  margin-right: 20px;
  border-radius: 4px;
  padding: 15px;
}

.el-main {
  padding: 0;
}
</style>
