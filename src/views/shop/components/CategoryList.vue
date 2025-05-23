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

    <!-- 桌面端菜单 -->
    <el-menu
      class="category-menu desktop-menu"
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

    <!-- 移动端标签 -->
    <div class="mobile-categories">
      <div class="category-tags">
        <el-tag
          class="category-tag"
          :class="{ active: activeCategory === 'all' }"
          @click="handleCategorySelect('all')"
          effect="plain">
          全部商品
        </el-tag>
        <el-tag
          v-for="category in categories"
          :key="category.id"
          class="category-tag"
          :class="{ active: activeCategory === category.id.toString() }"
          @click="handleCategorySelect(category.id.toString())"
          effect="plain">
          {{ category.name }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-list {
  margin-bottom: 20px;
}

/* 桌面端菜单样式 */
.desktop-menu {
  border-radius: 4px;
}

/* 移动端标签样式 */
.mobile-categories {
  display: none;
}

.category-tags {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 0;
  white-space: nowrap;
}

.category-tags::-webkit-scrollbar {
  height: 4px;
}

.category-tags::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.category-tags::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.category-tag {
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  background-color: #fff;
}

.category-tag:hover {
  border-color: #409eff;
  color: #409eff;
}

.category-tag.active {
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .category-list h2 {
    font-size: 18px;
    margin-bottom: 15px;
  }

  /* 隐藏桌面端菜单 */
  .desktop-menu {
    display: none;
  }

  /* 显示移动端标签 */
  .mobile-categories {
    display: block;
  }
}

@media (max-width: 480px) {
  .category-list h2 {
    font-size: 16px;
    margin-bottom: 10px;
  }

  .category-tags {
    gap: 6px;
    padding: 8px 0;
  }

  .category-tag {
    font-size: 12px;
    padding: 4px 8px;
  }
}
</style>
