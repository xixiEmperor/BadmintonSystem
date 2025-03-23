<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores'
import { Delete, Minus, Plus, Edit } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const cartStore = useCartStore()

// 编辑模式
const isEditMode = ref(false)

// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

// 增加商品数量
const increaseQuantity = (productId) => {
  const item = cartStore.cartItems.find((item) => item.id === productId)
  if (item) {
    cartStore.updateCartItemQuantity(productId, item.quantity + 1)
  }
}

// 减少商品数量
const decreaseQuantity = (productId) => {
  const item = cartStore.cartItems.find((item) => item.id === productId)
  if (item && item.quantity > 1) {
    cartStore.updateCartItemQuantity(productId, item.quantity - 1)
  }
}

// 删除购物车商品
const removeItem = (productId, productName) => {
  ElMessageBox.confirm(`确定要从购物车中移除 ${productName} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cartStore.removeFromCart(productId)
  })
}

// 清空购物车
const clearCart = () => {
  ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cartStore.clearCart()
  })
}

// 计算属性：总价
const totalPrice = computed(() => {
  return cartStore.totalPrice()
})

// 结算
const checkout = () => {
  if (cartStore.cartItems.length === 0) {
    ElMessageBox.alert('购物车是空的，请先添加商品！', '提示')
    return
  }

  ElMessageBox.confirm('确认结算当前购物车商品吗？', '确认结算', {
    confirmButtonText: '确认结算',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    // TODO: 实现结算逻辑，跳转到支付页面等
    ElMessageBox.alert('结算成功！', '提示')
    cartStore.clearCart()
  })
}
</script>

<template>
  <div class="cart-container">
    <div class="cart-header">
      <h2>我的购物车</h2>
      <div class="cart-actions">
        <el-button type="primary" :icon="Edit" @click="toggleEditMode">
          {{ isEditMode ? '完成' : '编辑' }}
        </el-button>
        <el-button type="danger" @click="clearCart" v-if="cartStore.cartItems.length > 0">
          清空购物车
        </el-button>
      </div>
    </div>

    <div v-if="cartStore.cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的，快去添加喜欢的商品吧！">
        <el-button type="primary" @click="$router.push('/shop')">去购物</el-button>
      </el-empty>
    </div>

    <div v-else class="cart-content">
      <el-table :data="cartStore.cartItems" style="width: 100%">
        <el-table-column label="商品" min-width="300">
          <template #default="scope">
            <div class="product-info">
              <el-image :src="scope.row.image" fit="cover" class="product-image"></el-image>
              <div class="product-details">
                <div class="product-name">{{ scope.row.name }}</div>
                <div class="product-price">¥{{ scope.row.price }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="单价" width="120" align="center">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>

        <el-table-column label="数量" width="180" align="center">
          <template #default="scope">
            <div class="quantity-control">
              <el-button
                :icon="Minus"
                circle
                size="small"
                @click="decreaseQuantity(scope.row.id)"
                :disabled="scope.row.quantity <= 1"
              ></el-button>
              <span class="quantity">{{ scope.row.quantity }}</span>
              <el-button
                :icon="Plus"
                circle
                size="small"
                @click="increaseQuantity(scope.row.id)"
              ></el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="小计" width="150" align="center">
          <template #default="scope">
            <span class="subtotal">¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button
              type="danger"
              :icon="Delete"
              circle
              @click="removeItem(scope.row.id, scope.row.name)"
              v-if="isEditMode"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="cart-footer">
        <div class="total-amount">
          <span>总计:</span>
          <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
        </div>
        <el-button type="primary" size="large" @click="checkout" :disabled="isEditMode">
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
