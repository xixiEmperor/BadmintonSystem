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

.category-list h2 {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  position: relative;
}

.category-list h2::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 桌面端菜单样式 */
.desktop-menu {
  border-radius: 8px;
  border: none;
  background: transparent;
}

:deep(.el-menu-item) {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

:deep(.el-menu-item:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
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
  background: rgba(241, 241, 241, 0.5);
  border-radius: 2px;
}

.category-tags::-webkit-scrollbar-thumb {
  background: rgba(193, 193, 193, 0.8);
  border-radius: 2px;
}

.category-tag {
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
}

.category-tag:hover {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.category-tag.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .category-list h2 {
    font-size: 16px;
    margin-bottom: 12px;
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
    font-size: 14px;
    margin-bottom: 10px;
  }

  .category-tags {
    gap: 6px;
    padding: 8px 0;
  }

  .category-tag {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
