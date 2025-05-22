<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Delete, Minus, Plus, Edit, ShoppingTrolley } from '@element-plus/icons-vue'
import {
  getCartList,
  updateCartItem,
  removeCartItem,
  selectCartItem,
  selectAllCartItems,
  clearCart as apiClearCart
} from '@/api/cart'

const router = useRouter()

// 购物车数据
const cartItems = ref([])
const loading = ref(false)
const isAllSelected = ref(false)

// 编辑模式
const isEditMode = ref(false)

// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

// 获取购物车列表
const fetchCartList = async () => {
  loading.value = true
  try {
    const response = await getCartList()
    if (response.data.code === 0) {
      cartItems.value = response.data.data.cartItems
      isAllSelected.value = response.data.data.allSelected
    }
  } catch (error) {
    console.error('获取购物车失败:', error)
    ElMessage.error('获取购物车失败')
  } finally {
    loading.value = false
  }
}

// 增加商品数量
const increaseQuantity = async (item) => {
  if (item.quantity >= item.stock) {
    ElMessage.warning(`商品"${item.productName}"已达到最大库存数量(${item.stock})`)
    return
  }

  try {
    const data = {
      quantity: item.quantity + 1
    }

    // 如果有规格，需要传递规格信息
    if (item.specificationId) {
      data.specs = item.specs
    }

    await updateCartItem(item.productId, data)
    // 更新成功后重新获取购物车列表
    fetchCartList()
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
  }
}

// 减少商品数量
const decreaseQuantity = async (item) => {
  if (item.quantity <= 1) {
    return
  }

  try {
    const data = {
      quantity: item.quantity - 1
    }

    // 如果有规格，需要传递规格信息
    if (item.specificationId) {
      data.specs = item.specs
    }

    await updateCartItem(item.productId, data)
    // 更新成功后重新获取购物车列表
    fetchCartList()
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
  }
}

// 删除购物车商品
const removeItem = (item) => {
  ElMessageBox.confirm(`确定要从购物车中移除 ${item.productName} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const data = {}
      // 如果有规格，需要传递规格信息
      if (item.specificationId) {
        data.specs = item.specs
      }

      await removeCartItem(item.productId, data)
      ElMessage.success('商品已从购物车中移除')
      // 删除成功后重新获取购物车列表
      fetchCartList()
    } catch (error) {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  }).catch(() => {})
}

// 选择/取消选择单个商品
const toggleSelectItem = async (item) => {
  try {
    const data = {
      selected: !item.selected
    }

    // 如果有规格，需要传递规格信息
    if (item.specificationId) {
      data.specs = item.specs
    }

    await selectCartItem(item.productId, data)
    // 更新成功后重新获取购物车列表
    fetchCartList()
  } catch (error) {
    console.error('更新选择状态失败:', error)
    ElMessage.error('更新选择状态失败')
  }
}

// 全选/取消全选
const toggleSelectAll = async () => {
  try {
    await selectAllCartItems(!isAllSelected.value)
    // 更新成功后重新获取购物车列表
    fetchCartList()
  } catch (error) {
    console.error('更新全选状态失败:', error)
    ElMessage.error('更新全选状态失败')
  }
}

// 清空购物车
const clearCartItems = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await apiClearCart()
      ElMessage.success('购物车已清空')
      // 清空成功后重新获取购物车列表
      fetchCartList()
    } catch (error) {
      console.error('清空购物车失败:', error)
      ElMessage.error('清空购物车失败')
    }
  }).catch(() => {})
}

// 计算属性：总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.quantity * item.productPrice, 0)
})

// 从购物车结算单个商品
const checkoutSingleItem = (product) => {
  // 创建结算订单对象（单商品）
  const orderInfo = {
    product: product,
    quantity: product.quantity,
    totalAmount: product.productPrice * product.quantity,
  }

  // 存储到localStorage以便结算页面使用
  localStorage.setItem('checkout_order', JSON.stringify(orderInfo))

  // 跳转到结算页面
  router.push('/checkout')
}

// 从购物车结算所有商品
const checkoutFromCart = () => {
  const selectedItems = cartItems.value.filter(item => item.selected)

  if (selectedItems.length === 0) {
    ElMessageBox.alert('请至少选择一件商品进行结算！', '提示')
    return
  }

  // 创建结算订单对象（多商品）
  const orderInfo = {
    products: selectedItems,
    totalAmount: totalPrice.value,
  }

  // 存储到localStorage以便结算页面使用
  localStorage.setItem('checkout_order', JSON.stringify(orderInfo))

  // 跳转到结算页面
  router.push('/checkout')
}

// 页面加载时获取购物车数据
onMounted(() => {
  fetchCartList()
})
</script>

<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>我的购物车</h2>
      <div class="cart-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">
          {{ isEditMode ? '完成' : '编辑' }}
        </el-button>
        <el-button type="danger" @click="clearCartItems" v-if="cartItems.length > 0">
          清空购物车
        </el-button>
      </div>
    </div>

    <div v-if="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的，快去添加喜欢的商品吧！">
        <el-button type="primary" @click="$router.push('/shop')">去购物</el-button>
      </el-empty>
    </div>

    <div v-else class="cart-content">
      <el-table :data="cartItems" style="width: 100%">
        <el-table-column width="55" align="center">
          <template #header>
            <el-checkbox v-model="isAllSelected" @change="toggleSelectAll" />
          </template>
          <template #default="scope">
            <el-checkbox v-model="scope.row.selected" @change="() => toggleSelectItem(scope.row)" />
          </template>
        </el-table-column>

        <el-table-column label="商品" min-width="300">
          <template #default="scope">
            <div class="product-info">
              <el-image :src="scope.row.productImage" fit="cover" class="product-image"></el-image>
              <div class="product-details">
                <div v-if="Object.keys(scope.row.specs || {}).length > 0" class="product-name">
                  {{ scope.row.productName }} ({{ Object.entries(scope.row.specs).map(([key, value]) => `${value}`).join('、') }})
                </div>
                <div v-else class="product-name">{{ scope.row.productName }}</div>
                <div class="product-price">¥{{ scope.row.productPrice }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="单价" width="120" align="center">
          <template #default="scope">
            <span class="price">¥{{ scope.row.productPrice }}</span>
          </template>
        </el-table-column>

        <el-table-column label="数量" width="180" align="center">
          <template #default="scope">
            <div class="quantity-control">
              <el-button
                :icon="Minus"
                circle
                size="small"
                @click="decreaseQuantity(scope.row)"
                :disabled="scope.row.quantity <= 1"
              ></el-button>
              <span class="quantity">{{ scope.row.quantity }}</span>
              <el-button
                :icon="Plus"
                circle
                size="small"
                @click="increaseQuantity(scope.row)"
                :disabled="scope.row.quantity >= scope.row.stock"
              ></el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="小计" width="150" align="center">
          <template #default="scope">
            <span class="subtotal">¥{{ (scope.row.productPrice * scope.row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeItem(scope.row)"
              v-if="isEditMode"
            ></el-button>
            <el-button
              v-else
              type="primary"
              :icon="ShoppingTrolley"
              circle
              @click="checkoutSingleItem(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="cart-footer">
        <div class="total-amount">
          <span>总计:</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <el-button type="primary" size="large" @click="checkoutFromCart" :disabled="isEditMode">
          结算
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.cart-header h2 {
  color: #2b6fc2;
  margin: 0;
}

.cart-actions {
  display: flex;
  gap: 10px;
}

.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  border-radius: 4px;
}

.product-details {
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 16px;
  margin-bottom: 5px;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity {
  padding: 0 15px;
  min-width: 40px;
  text-align: center;
}

.price,
.subtotal {
  color: #f56c6c;
  font-weight: bold;
}

.cart-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.total-amount {
  margin-right: 20px;
  font-size: 18px;
}

.total-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 24px;
  margin-left: 10px;
}

@media (max-width: 768px) {
  .cart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cart-actions {
    margin-top: 10px;
  }

  .product-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-bottom: 10px;
    margin-right: 0;
  }

  .cart-footer {
    flex-direction: column;
    align-items: flex-end;
  }

  .total-amount {
    margin-bottom: 15px;
    margin-right: 0;
  }
}
</style>
