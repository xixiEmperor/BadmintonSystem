<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/shop'
import SpecificationSelector from './SpecificationSelector.vue'
import { useCartStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)
const productDetail = ref(null)
const subImageList = ref([])
const activeTab = ref('detail')

// 当前选中的规格
const currentSpecification = ref(null)
// 是否可以添加到购物车
const canAddToCart = ref(false)
// 购买数量
const quantity = ref(1)

// 计算总价
const totalPrice = computed(() => {
  if (!productDetail.value) return 0

  let price = productDetail.value.price
  if (productDetail.value.hasSpecification === 1 && currentSpecification.value) {
    price = Number(price) + Number(currentSpecification.value.priceAdjustment)
  }

  return (price * quantity.value).toFixed(2)
})

// 获取商品详情
const fetchProductDetail = async (productId) => {
  loading.value = true
  try {
    const response = await getProductDetail(productId)
    if (response.data.code === 0) {
      productDetail.value = response.data.data
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 切换主图
const switchMainImage = (imgUrl) => {
  if (productDetail.value) {
    productDetail.value.mainImage = imgUrl
  }
}

// 处理规格选择完成
const handleSpecificationSelected = (specification) => {
  currentSpecification.value = specification
  // 有规格且库存>0时才能加入购物车
  canAddToCart.value = specification && specification.stock > 0
  // 重置数量
  quantity.value = 1
}

// 处理规格选择变化
const handleSpecificationChange = () => {
  // 规格变化但未完成选择，此时不能加入购物车
  canAddToCart.value = false
}

// 增加数量
const increaseQuantity = () => {
  const maxStock = productDetail.value.hasSpecification === 1 && currentSpecification.value
    ? currentSpecification.value.stock
    : productDetail.value.stock

  if (quantity.value < maxStock) {
    quantity.value++
  } else {
    ElMessage.warning('已达到最大库存数量')
  }
}

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 添加到购物车
const addToCart = async () => {
  if (!canAddToCart.value) {
    ElMessage.warning('请先选择有效的商品规格')
    return
  }

  let cartItem = null

  if (productDetail.value.hasSpecification === 1 && currentSpecification.value) {
    // 有规格的商品
    cartItem = {
      productId: productDetail.value.id,
      name: productDetail.value.name,
      price: Number(productDetail.value.price) + Number(currentSpecification.value.priceAdjustment),
      image: productDetail.value.mainImage,
      specificationId: currentSpecification.value.id,
      specifications: currentSpecification.value.specifications,
      quantity: quantity.value,
      stock: currentSpecification.value.stock
    }
  } else {
    // 无规格的商品
    cartItem = {
      productId: productDetail.value.id,
      name: productDetail.value.name,
      price: productDetail.value.price,
      image: productDetail.value.mainImage,
      quantity: quantity.value,
      stock: productDetail.value.stock
    }
  }

  // 添加到购物车
  await cartStore.addToCart(cartItem)
  ElMessage.success('已添加到购物车')
}

// 立即购买
const buyNow = () => {
  if (!canAddToCart.value) {
    ElMessage.warning('请先选择有效的商品规格')
    return
  }

  // 跳转到结算页面
  router.push('/checkout')
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
                <span class="label">原价:</span>
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
              <SpecificationSelector
                :productId="Number(route.params.id)"
                :basePrice="productDetail.price"
                :hasSpecification="productDetail.hasSpecification === 1"
                :specifications="productDetail.specifications"
                @specification-selected="handleSpecificationSelected"
                @specification-change="handleSpecificationChange"
              />
            </div>

            <!-- 数量选择 -->
            <div class="quantity-selection">
              <span class="label">数量:</span>
              <div class="quantity-control">
                <el-button type="primary" circle size="small" @click="decreaseQuantity" :disabled="quantity <= 1">-</el-button>
                <el-input
                  v-model="quantity"
                  :min="1"
                  :max="productDetail.hasSpecification === 1 && currentSpecification ? currentSpecification.stock : productDetail.stock"
                  size="small"
                  style="width: 120px"
                  :disabled="!canAddToCart">
                </el-input>
                <el-button type="primary" circle size="small" @click="increaseQuantity" :disabled="!canAddToCart">+</el-button>
              </div>
            </div>

            <!-- 总价显示 -->
            <div class="total-price-section">
              <span class="label">总价:</span>
              <span class="total-price">¥{{ totalPrice }}</span>
            </div>

            <!-- 购买按钮区域 -->
            <div class="action-buttons">
              <el-button
                type="primary"
                size="large"
                :disabled="!canAddToCart"
                @click="addToCart">
                加入购物车
              </el-button>
              <el-button
                type="danger"
                size="large"
                :disabled="!canAddToCart"
                @click="buyNow">
                立即购买
              </el-button>
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

.quantity-selection {
  margin: 20px 0;
  display: flex;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.total-price-section {
  margin: 20px 0;
  display: flex;
  align-items: center;
}

.total-price {
  font-size: 26px;
  font-weight: bold;
  color: #ff6700;
}
</style>
