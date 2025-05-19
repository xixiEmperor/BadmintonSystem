<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
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
        <el-form-item label="排序方式" style="width: 240px">
          <el-select v-model="searchParams.orderBy" placeholder="请选择">
            <el-option label="默认排序" value=""></el-option>
            <el-option label="价格升序" value="price_asc"></el-option>
            <el-option label="价格降序" value="price_desc"></el-option>
            <el-option label="销量降序" value="sales_desc"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchParams.keyword" placeholder="请输入关键词" @keyup.enter="handleSearch"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 商品列表 -->
    <div class="product-grid" v-loading="loading">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="product in products" :key="product.id">
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
        layout="total, sizes, prev, pager, next, jumper"
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
</style>
