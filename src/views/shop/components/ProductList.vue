<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProducts } from '@/api/shop'

// 接收props
const props = defineProps({
  categoryId: {
    type: [String, Number],
    default: 'all'
  }
})

const router = useRouter()
const loading = ref(false)
const products = ref([])

// 搜索参数
const searchParams = reactive({
  keyword: '',
  orderBy: '',
  pageNum: 1,
  pageSize: 10,
  categoryId: props.categoryId
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 4,
  total: 0
})

// 计算分页布局（移动端简化显示）
const paginationLayout = computed(() => {
  if (window.innerWidth <= 768) {
    return 'prev, pager, next'
  }
  return 'total, sizes, prev, pager, next, jumper'
})

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const response = await getProducts(searchParams)
    if (response.data.code === 0) {
      products.value = response.data.data.list
      pagination.pageNum = response.data.data.pageNum
      pagination.pageSize = response.data.data.pageSize
      pagination.total = response.data.data.total
    } else {
      ElMessage.error('获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 监听分类变化
watch(() => props.categoryId, (newVal) => {
  searchParams.categoryId = newVal
  searchParams.pageNum = 1 // 切换分类时重置为第一页
  fetchProducts()
}, { immediate: true })

// 搜索
const handleSearch = () => {
  searchParams.pageNum = 1 // 搜索时重置为第一页
  fetchProducts()
}

// 重置搜索
const resetSearch = () => {
  searchParams.keyword = ''
  searchParams.orderBy = ''
  searchParams.pageNum = 1
  fetchProducts()
}

// 每页条数变化
const handleSizeChange = (val) => {
  searchParams.pageSize = val
  fetchProducts()
}

// 页码变化
const handleCurrentChange = (val) => {
  searchParams.pageNum = val
  fetchProducts()
}

// 前往详情页
const goToDetail = (productId) => {
  router.push(`/product/${productId}`)
}

// 在组件挂载时获取商品列表
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="product-list">
    <!-- 筛选面板 -->
    <div class="filter-panel">
      <el-form :inline="true" class="filter-form">
        <div class="filter-row">
          <el-form-item label="排序方式" class="sort-item">
            <el-select v-model="searchParams.orderBy" placeholder="请选择">
              <el-option label="默认排序" value=""></el-option>
              <el-option label="价格升序" value="price_asc"></el-option>
              <el-option label="价格降序" value="price_desc"></el-option>
              <el-option label="销量降序" value="sales_desc"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="关键词" class="search-item">
            <el-input v-model="searchParams.keyword" placeholder="请输入关键词" @keyup.enter="handleSearch"></el-input>
          </el-form-item>
        </div>
        <div class="button-row">
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 商品列表 -->
    <div class="product-grid" v-loading="loading">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="8" :lg="6" v-for="product in products" :key="product.id">
          <el-card class="product-card" @click="goToDetail(product.id)">
            <img :src="product.mainImage" class="product-image">
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-subtitle">{{ product.subtitle }}</p>
              <div class="product-price-row">
                <span class="product-price">¥{{ product.price.toFixed(2) }}</span>
                <span class="product-sales">销量: {{ product.sales }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <el-empty v-if="products.length === 0 && !loading" description="暂无商品"></el-empty>
    </div>

    <!-- 分页控件 -->
    <div class="pagination-container" v-if="pagination.total > 0">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[4, 6, 8, 10]"
        :page-size="pagination.pageSize"
        :layout="paginationLayout"
        :total="pagination.total">
      </el-pagination>
    </div>
  </div>
</template>

<style scoped>
.product-list {
  margin-bottom: 30px;
}

.filter-panel {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.filter-form {
  width: 100%;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.sort-item {
  flex: 1;
  min-width: 200px;
}

.search-item {
  flex: 2;
  min-width: 200px;
}

.button-row {
  display: flex;
  justify-content: flex-end;
}

.product-grid {
  min-height: 300px;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-name {
  margin: 10px 0 5px;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-subtitle {
  margin: 0 0 10px;
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff6700;
}

.product-sales {
  font-size: 12px;
  color: #999;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

/* 移动端响应式样式 */
@media (max-width: 768px) {
  .filter-panel {
    padding: 10px;
  }

  .filter-row {
    flex-direction: column;
    gap: 5px;
    margin-bottom: 15px;
  }

  .sort-item,
  .search-item {
    flex: none;
    min-width: auto;
    width: 100%;
  }

  .button-row {
    justify-content: center;
  }

  .product-image {
    height: 150px;
  }

  .product-info {
    padding: 8px;
  }

  .product-name {
    font-size: 14px;
    margin: 8px 0 4px;
  }

  .product-subtitle {
    font-size: 11px;
    margin: 0 0 8px;
  }

  .product-price {
    font-size: 16px;
  }

  .product-sales {
    font-size: 11px;
  }

  .pagination-container {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .filter-panel {
    padding: 8px;
    margin-bottom: 15px;
  }

  .product-card {
    margin-bottom: 15px;
  }

  .product-image {
    height: 120px;
  }

  .product-info {
    padding: 6px;
  }

  .product-name {
    font-size: 13px;
    margin: 6px 0 3px;
  }

  .product-subtitle {
    font-size: 10px;
    margin: 0 0 6px;
  }

  .product-price {
    font-size: 14px;
  }

  .product-sales {
    font-size: 10px;
  }
}
</style>
