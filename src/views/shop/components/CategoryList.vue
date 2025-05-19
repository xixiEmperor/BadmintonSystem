<script setup>
import { ref, onMounted } from 'vue'
import { getCategories } from '@/api/shop'

// 响应式数据
const categories = ref([])
const activeCategory = ref('all')

// 获取分类列表
const fetchCategories = async () => {
  const response = await getCategories()
  categories.value = response.data.data
}

// 处理分类选择
const handleCategorySelect = (categoryId) => {
  activeCategory.value = categoryId
  // 向父组件发送事件
  emit('category-selected', categoryId)
}

// 定义组件发出的事件
const emit = defineEmits(['category-selected'])

// 在组件挂载时获取分类数据
onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div class="category-list">
    <h2>商品分类</h2>
    <el-menu
      class="category-menu"
      :default-active="activeCategory"
      @select="handleCategorySelect">
      <el-menu-item index="all">
        全部商品
      </el-menu-item>
      <el-menu-item
        v-for="category in categories"
        :key="category.id"
        :index="category.id.toString()">
        {{ category.name }}
      </el-menu-item>
    </el-menu>
  </div>
</template>

<style scoped>
.category-list {
  margin-bottom: 20px;
}
.category-menu {
  border-radius: 4px;
}
</style>
