<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores'
import { ElMessage } from 'element-plus'

const cartStore = useCartStore()

const products = ref([
  {
    id: 1,
    name: 'YONEX羽毛球拍',
    price: 599,
    image: 'https://via.placeholder.com/200',
    category: '羽毛球拍',
    sales: 256,
  },
  {
    id: 2,
    name: '李宁羽毛球拍',
    price: 399,
    image: 'https://via.placeholder.com/200',
    category: '羽毛球拍',
    sales: 199,
  },
  {
    id: 3,
    name: '球友系列羽毛球',
    price: 89,
    image: 'https://via.placeholder.com/200',
    category: '羽毛球',
    sales: 568,
  },
  {
    id: 4,
    name: '专业比赛羽毛球',
    price: 159,
    image: 'https://via.placeholder.com/200',
    category: '羽毛球',
    sales: 305,
  },
  {
    id: 5,
    name: '运动护腕',
    price: 39,
    image: 'https://via.placeholder.com/200',
    category: '配件',
    sales: 423,
  },
  {
    id: 6,
    name: '羽毛球鞋',
    price: 499,
    image: 'https://via.placeholder.com/200',
    category: '服装鞋帽',
    sales: 189,
  },
])

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
              <el-button type="warning" size="small">立即购买</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
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
</style>
