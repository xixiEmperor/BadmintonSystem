<template>
  <div class="product-detail" v-loading="loading">
    <div v-if="productDetail">
      <!-- 面包屑导航 -->
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/shop', query: { categoryId: productDetail.categoryId } }">
          {{ productDetail.categoryName }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ productDetail.name }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 商品基本信息 -->
      <el-row :gutter="30" class="product-info-container">
        <!-- 商品图片区 -->
        <el-col :span="12">
          <div class="product-gallery">
            <!-- 主图 -->
            <div class="main-image">
              <el-image :src="productDetail.mainImage" fit="contain"></el-image>
            </div>

            <!-- 子图列表 -->
            <div class="sub-images" v-if="subImageList && subImageList.length > 0">
              <el-image
                v-for="(img, index) in subImageList"
                :key="index"
                :src="img"
                fit="cover"
                class="sub-image-item"
                @click="switchMainImage(img)">
              </el-image>
            </div>
          </div>
        </el-col>

        <!-- 商品信息区 -->
        <el-col :span="12">
          <div class="product-info">
            <h1 class="product-name">{{ productDetail.name }}</h1>
            <p class="product-subtitle">{{ productDetail.subtitle }}</p>

            <div class="product-meta">
              <div class="price-row">
                <span class="label">价格:</span>
                <span class="price">¥{{ productDetail.price.toFixed(2) }}</span>
              </div>

              <div class="stock-row">
                <span class="label">库存:</span>
                <span class="stock" :class="{'low-stock': productDetail.stock < 10}">
                  {{ productDetail.stock > 0 ? productDetail.stock : '无货' }}
                </span>
              </div>

              <div class="sales-row">
                <span class="label">销量:</span>
                <span class="sales">{{ productDetail.sales }}</span>
              </div>
            </div>

            <!-- 规格选择区域，如果有规格的话 -->
            <div class="spec-selection" v-if="productDetail.hasSpecification === 1">
              <!-- 规格选择UI将在后续开发 -->
              <p class="spec-notice">该商品有多种规格可选</p>
            </div>

            <!-- 购买按钮区域 -->
            <div class="action-buttons">
              <el-button type="primary" size="large" :disabled="productDetail.stock <= 0">
                加入购物车
              </el-button>
              <el-button size="large">收藏商品</el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 商品详情内容 -->
      <div class="product-detail-content">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content" v-html="productDetail.detail"></div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="specs">
            <div class="specs-content">
              <!-- 规格参数内容 -->
              <p v-if="!productDetail.hasSpecification">该商品暂无规格参数</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 加载失败显示 -->
    <el-result
      v-if="!loading && !productDetail"
      icon="error"
      title="商品加载失败"
      sub-title="未找到商品信息或者商品已下架">
      <template #extra>
        <el-button type="primary" @click="goBack">返回商城</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/shop'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const productDetail = ref(null)
const subImageList = ref([])
const activeTab = ref('detail')

// 获取商品详情
const fetchProductDetail = (productId) => {
  loading.value = true

  getProductDetail(productId)
    .then(response => {
      if (response.data.status === 0) {
        productDetail.value = response.data.data

        // 解析子图列表
        if (productDetail.value.subImages) {
          subImageList.value = productDetail.value.subImages.split(',')
        }

        // 设置页面标题
        document.title = productDetail.value.name
      }
    })
    .catch(error => {
      console.error('获取商品详情失败:', error)
      ElMessage.error('获取商品详情失败')
    })
    .finally(() => {
      loading.value = false
    })
}

// 切换主图
const switchMainImage = (imgUrl) => {
  if (productDetail.value) {
    productDetail.value.mainImage = imgUrl
  }
}

// 返回商城
const goBack = () => {
  router.push('/shop')
}

// 在组件挂载时获取商品详情
onMounted(() => {
  const productId = route.params.id
  if (productId) {
    fetchProductDetail(productId)
  } else {
    loading.value = false
  }
})
</script>

<style scoped>
.product-detail {
  padding: 20px 0;
}

.product-info-container {
  margin: 30px 0;
}

.product-gallery {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.sub-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.sub-image-item {
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: border-color 0.3s;
}

.sub-image-item:hover {
  border-color: #409EFF;
}

.product-info {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.product-name {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.4;
}

.product-subtitle {
  margin: 0 0 20px;
  font-size: 14px;
  color: #666;
}

.product-meta {
  margin-bottom: 30px;
}

.product-meta > div {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.label {
  min-width: 60px;
  color: #666;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #ff6700;
}

.stock {
  font-size: 16px;
}

.low-stock {
  color: #f56c6c;
}

.sales {
  font-size: 16px;
}

.spec-notice {
  color: #409EFF;
  margin-bottom: 15px;
}

.action-buttons {
  margin-top: 30px;
}

.action-buttons .el-button {
  margin-right: 15px;
}

.product-detail-content {
  margin-top: 30px;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
}

.detail-content {
  padding: 20px 0;
}

/* 处理商品详情中的HTML内容 */
.detail-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.detail-content :deep(p) {
  margin-bottom: 10px;
}

.detail-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.detail-content :deep(table), .detail-content :deep(th), .detail-content :deep(td) {
  border: 1px solid #ddd;
  padding: 8px;
}
</style>
