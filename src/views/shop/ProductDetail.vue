<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '@/api/shop'
import { useCartStore } from '@/stores/modules/cart'
import SpecificationSelector from './components/SpecificationSelector.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const loading = ref(true)
const productDetail = ref(null)
const imageList = ref([])
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
      // 如果无规格，则可以加入购物车和购买
      if(productDetail.value.hasSpecification === 0 && productDetail.value.stock){
        canAddToCart.value = true
      }
      // 处理图片列表
      processImages()
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 处理主图和副图，组合成图片列表
const processImages = () => {
  if (!productDetail.value) return

  // 图片列表清空
  imageList.value = []

  // 添加主图
  if (productDetail.value.mainImage) {
    imageList.value.push(productDetail.value.mainImage)
  }

  // 处理副图，如果是字符串，尝试拆分
  if (productDetail.value.subImages) {
    let subImages = productDetail.value.subImages
    if (typeof subImages === 'string') {
      // 字符串形式，可能是逗号分隔的URL
      subImages = subImages.split(',').map(url => url.trim())
    } else if (Array.isArray(subImages)) {
      // 已经是数组形式
      subImages = [...subImages]
    }

    // 添加到图片列表
    imageList.value.push(...subImages)
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
const addToCartHandler = async () => {
  if (!canAddToCart.value) {
    ElMessage.warning('请先选择有效的商品规格')
    return
  }

  // 构建商品数据
  const cartItem = {
    productId: productDetail.value.id,
    productName: productDetail.value.name,
    productImage: productDetail.value.mainImage,
    productPrice: productDetail.value.price,
    quantity: quantity.value,
    stock: productDetail.value.hasSpecification === 1 && currentSpecification.value
      ? currentSpecification.value.stock
      : productDetail.value.stock,
    selected: true
  }

  // 如果有规格，添加规格信息
  if (productDetail.value.hasSpecification === 1 && currentSpecification.value) {
    cartItem.specificationId = currentSpecification.value.id
    cartItem.specs = currentSpecification.value.specifications
    cartItem.priceAdjustment = currentSpecification.value.priceAdjustment
  } else {
    cartItem.priceAdjustment = 0
  }

  // 使用 store 添加到购物车
  const success = await cartStore.addToCart(cartItem)
  if (success) {
    ElMessage.success('已添加到购物车')
  }
}

// 立即购买
const buyNow = async () => {
  if (!canAddToCart.value) {
    ElMessage.warning('请先选择有效的商品规格')
    return
  }

  // 构建完整的商品信息，仿照购物车结算逻辑
  const productInfo = {
    productId: productDetail.value.id,
    productName: productDetail.value.name,
    productImage: productDetail.value.mainImage,
    productPrice: productDetail.value.price,
    quantity: quantity.value,
    stock: productDetail.value.hasSpecification === 1 && currentSpecification.value
      ? currentSpecification.value.stock
      : productDetail.value.stock,
    selected: true
  }

  // 如果有规格，添加规格信息
  if (productDetail.value.hasSpecification === 1 && currentSpecification.value) {
    productInfo.specificationId = currentSpecification.value.id
    productInfo.specs = currentSpecification.value.specifications
    productInfo.priceAdjustment = currentSpecification.value.priceAdjustment
  } else {
    productInfo.priceAdjustment = 0
  }

  // 计算实际价格和总金额
  const actualPrice = productInfo.productPrice + (productInfo.priceAdjustment || 0)
  const totalAmount = actualPrice * productInfo.quantity

  // 添加实际价格字段
  productInfo.actualPrice = actualPrice

  // 创建结算订单对象（单商品立即购买）
  const orderInfo = {
    products: [productInfo], // 包装成数组，与购物车结算保持一致
    totalAmount: totalAmount,
    isBuyNow: true // 标识这是立即购买订单
  }

  // 存储到localStorage以便结算页面使用
  localStorage.setItem('checkout_order', JSON.stringify(orderInfo))

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
            <!-- 图片轮播 -->
            <el-carousel :interval="4000" type="card" height="400px" v-if="imageList.length > 0" ref="carousel">
              <el-carousel-item v-for="(img, index) in imageList" :key="index">
                <el-image :src="img" fit="contain" class="carousel-image"></el-image>
              </el-carousel-item>
            </el-carousel>

            <!-- 缩略图列表 -->
            <div class="thumbnail-list" v-if="imageList.length > 1">
              <div
                v-for="(img, index) in imageList"
                :key="index"
                class="thumbnail-item"
                @click="$refs.carousel.setActiveItem(index)">
                <el-image :src="img" fit="cover"></el-image>
              </div>
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
                @click="addToCartHandler">
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
  padding: 15px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.thumbnail-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  justify-content: center;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: border-color 0.3s;
  overflow: hidden;
}

.thumbnail-item:hover {
  border-color: #409EFF;
}

.thumbnail-item .el-image {
  width: 100%;
  height: 100%;
}

/* Element Plus Carousel 样式覆盖 */
:deep(.el-carousel__item) {
  background-color: #fff;
}

:deep(.el-carousel__item--card) {
  border-radius: 4px;
  overflow: hidden;
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
