<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartStore = useCartStore()

// 商品库存信息（模拟数据）
const inventory = {
  1: 50,
  2: 35,
  3: 100,
  4: 80,
  5: 200,
  6: 30,
}

const products = ref([
  {
    id: 1,
    name: '天斧100ZZ古红色 4UG5 力量+速度+控制',
    price: 1468,
    image: 'https://img.alicdn.com/imgextra/i3/418340688/O1CN010eNZ8q1Gx9EQl2l6Y_!!418340688.jpg',
    category: '羽毛球拍',
    sales: 256,
  },
  {
    id: 2,
    name: '雷霆100 4U【送李宁羽线+手胶】',
    price: 1353,
    image:
      'https://img.alicdn.com/imgextra/i2/2212018753248/O1CN01j4CnC31ZrdRkfmSXE_!!2212018753248.jpg',
    category: '羽毛球拍',
    sales: 199,
  },
  {
    id: 3,
    name: '亚狮龙3号',
    price: 175,
    image: 'https://img.alicdn.com/imgextra/i4/4125027058/O1CN01aWa8Cv220cIBLvtV3_!!4125027058.jpg',
    category: '羽毛球',
    sales: 568,
  },
  {
    id: 4,
    name: 'YONEX尤尼克斯羽毛球AS05球12只装',
    price: 199,
    image: 'https://img.alicdn.com/imgextra/i4/2929073922/O1CN01kWNU5k1eqKPR1UZOh_!!2929073922.jpg',
    category: '羽毛球',
    sales: 305,
  },
  {
    id: 5,
    name: '李宁护腕手腕tfcc羽毛球扭伤男女款',
    price: 22,
    image: 'https://img.alicdn.com/imgextra/i2/1867303559/O1CN01CXZ0XO1cA4cb9KMWJ_!!1867303559.jpg',
    category: '配件',
    sales: 423,
  },
  {
    id: 6,
    name: '尤尼克斯 AC994CR 羽毛球拍印花手胶',
    price: 56,
    image: 'https://img.alicdn.com/imgextra/i2/3696234826/O1CN01bceEQ21lWMNti39OP_!!3696234826.jpg',
    category: '服装鞋帽',
    sales: 189,
  },
])

// 立即购买弹窗控制
const buyDialogVisible = ref(false)
const selectedProduct = ref(null)
const buyQuantity = ref(1)
const userAddress = ref('')

// 打开立即购买弹窗
const openBuyDialog = (product) => {
  selectedProduct.value = product
  buyQuantity.value = 1
  buyDialogVisible.value = true
}

// 增加购买数量
const increaseBuyQuantity = () => {
  if (buyQuantity.value < inventory[selectedProduct.value.id]) {
    buyQuantity.value++
  } else {
    ElMessage.warning('已达到最大库存数量')
  }
}

// 减少购买数量
const decreaseBuyQuantity = () => {
  if (buyQuantity.value > 1) {
    buyQuantity.value--
  }
}

// 直接购买商品
const buyNow = () => {
  if (!userAddress.value) {
    ElMessage.warning('请填写收货地址')
    return
  }

  // 创建订单对象
  const orderInfo = {
    product: selectedProduct.value,
    quantity: buyQuantity.value,
    address: userAddress.value,
    totalAmount: selectedProduct.value.price * buyQuantity.value,
  }

  // 存储到localStorage以便结算页面使用
  localStorage.setItem('checkout_order', JSON.stringify(orderInfo))

  // 关闭弹窗并跳转到结算页面
  buyDialogVisible.value = false
  router.push('/checkout')
}

// 获取商品列表
const fetchProducts = () => {
  // TODO: 调用API从后端获取商品列表
}

const categories = ref(['全部', '羽毛球拍', '羽毛球', '配件', '服装鞋帽'])

const activeCategory = ref('全部')

const filteredProducts = computed(() => {
  if (activeCategory.value === '全部') return products.value
  return products.value.filter((product) => product.category === activeCategory.value)
})

function changeCategory(category) {
  activeCategory.value = category
}

// 加入购物车
const addToCart = (product) => {
  cartStore.addToCart(product)
  ElMessage({
    message: `已将 ${product.name} 加入购物车`,
    type: 'success',
  })
}

// 组件挂载时获取商品数据
onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="shop-container">
    <h2>羽体商城</h2>

    <div class="categories">
      <div
        v-for="category in categories"
        :key="category"
        class="category-item"
        :class="{ active: activeCategory === category }"
        @click="changeCategory(category)"
      >
        {{ category }}
      </div>
    </div>

    <div class="products-container">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="8" v-for="product in filteredProducts" :key="product.id">
          <el-card class="product-card" shadow="hover">
            <div class="product-image">
              <el-image :src="product.image" fit="cover"></el-image>
              <div class="product-sales">销量: {{ product.sales }}</div>
            </div>
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price }}</div>
            </div>
            <div class="product-actions">
              <el-button type="danger" size="small" @click="addToCart(product)"
                >加入购物车</el-button
              >
              <el-button type="warning" size="small" @click="openBuyDialog(product)"
                >立即购买</el-button
              >
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 立即购买弹窗 -->
    <el-dialog v-model="buyDialogVisible" title="立即购买" width="500px" destroy-on-close>
      <div v-if="selectedProduct" class="buy-dialog-content">
        <div class="selected-product">
          <el-image
            :src="selectedProduct.image"
            class="product-image"
            fit="contain"
            :preview-src-list="[selectedProduct.image]"
            preview-teleported
          ></el-image>
          <div class="product-details">
            <h3>{{ selectedProduct.name }}</h3>
            <div class="product-price">¥{{ selectedProduct.price }}</div>
            <div class="product-stock">库存: {{ inventory[selectedProduct.id] }}件</div>
          </div>
        </div>

        <div class="buy-quantity">
          <span class="label">购买数量:</span>
          <div class="quantity-control">
            <el-button :disabled="buyQuantity <= 1" @click="decreaseBuyQuantity">-</el-button>
            <span class="quantity">{{ buyQuantity }}</span>
            <el-button
              :disabled="buyQuantity >= inventory[selectedProduct.id]"
              @click="increaseBuyQuantity"
              >+</el-button
            >
          </div>
        </div>

        <div class="address-input">
          <span class="label">收货地址:</span>
          <el-input
            v-model="userAddress"
            type="textarea"
            :rows="2"
            placeholder="请输入详细收货地址"
          >
          </el-input>
        </div>

        <div class="total-price">
          <span>总计:</span>
          <span class="price">¥{{ (selectedProduct.price * buyQuantity).toFixed(2) }}</span>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="buyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="buyNow">立即结算</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.shop-container {
  padding: 0;
}

h2 {
  text-align: center;
  color: #2b6fc2;
  margin-bottom: 30px;
}

.categories {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.category-item {
  padding: 8px 20px;
  margin: 0 10px;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s;
  background-color: #f5f5f5;
}

.category-item.active {
  background-color: #2b6fc2;
  color: white;
}

.products-container {
  margin-top: 30px;
}

.product-card {
  margin-bottom: 20px;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  margin-bottom: 10px;
  height: 250px;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-sales {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 2px 8px;
  font-size: 12px;
  border-top-left-radius: 4px;
}

.product-info {
  padding: 0 10px;
  margin-bottom: 15px;
}

.product-name {
  font-size: 16px;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 10px 10px;
}

.buy-dialog-content {
  padding: 10px;
}

.selected-product {
  display: flex;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.selected-product .product-image {
  width: 100px;
  height: 100px;
  margin-right: 15px;
  border-radius: 4px;
  overflow: hidden;
  object-fit: contain;
}

.selected-product .product-details {
  flex: 1;
}

.selected-product h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.selected-product .product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.selected-product .product-stock {
  color: #67c23a;
  font-size: 14px;
}

.buy-quantity {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.label {
  width: 100px;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-control .quantity {
  margin: 0 10px;
  min-width: 30px;
  text-align: center;
}

.address-input {
  display: flex;
  margin-bottom: 20px;
}

.total-price {
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  margin-top: 20px;
}

.total-price .price {
  color: #f56c6c;
  font-size: 20px;
  margin-left: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
