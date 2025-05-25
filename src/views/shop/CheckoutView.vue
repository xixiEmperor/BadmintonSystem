<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createOrder, createOrderForProduct } from '@/api/pay'
import { BUSINESS_TYPE } from '@/api/pay'
import { useCartStore } from '@/stores/modules/cart'

const router = useRouter()
const cartStore = useCartStore()

// 订单信息
const orderInfo = ref(null)
// 订单备注
const remarks = ref('')
// 加载状态
const loading = ref(false)

// 返回购物车
const backToCart = () => {
  router.push('/cart')
}

// 创建订单
const submitOrder = async () => {
  try {
    loading.value = true

    let response

    // 根据订单类型调用不同的API
    if (orderInfo.value.isBuyNow) {
      // 单个商品结算 - 调用立即购买API
      const orderData = {
        productId: orderInfo.value.products[0].productId,
        quantity: orderInfo.value.products[0].quantity,
        specs: orderInfo.value.products[0].specs || {}
      }
      response = await createOrderForProduct(orderData)
    } else {
      // 多个商品结算(购物车) - 调用购物车结算API
      response = await createOrder()
    }

    if (response.data.code === 0) {
      const orderNo = response.data.data

      // 将订单号和金额信息传递给支付页面
      const paymentInfo = {
        orderNo: orderNo,
        amount: orderInfo.value.totalAmount,
        businessType: BUSINESS_TYPE.MALL,
        remarks: remarks.value
      }

      // 存储支付信息
      localStorage.setItem('payment_info', JSON.stringify(paymentInfo))

      // 只有购物车结算才需要删除购物车中的商品
      if (orderInfo.value.products) {
        try {
          const removeSuccess = await cartStore.removeOrderedItems(orderInfo.value)
          if (!removeSuccess) {
            console.warn('部分购物车商品删除失败，但订单已创建成功')
          }
        } catch (error) {
          console.error('删除购物车商品时出错:', error)
          // 即使删除购物车商品失败，订单已经创建成功，继续后续流程
        }
      }

      // 清除订单信息
      localStorage.removeItem('checkout_order')

      ElMessage.success('订单创建成功，即将跳转到支付页面')

      // 跳转到支付页面
      setTimeout(() => {
        router.push('/payment')
      }, 1000)

    } else {
      ElMessage.error(response.message || '创建订单失败')
    }
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('创建订单失败，请重试')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取订单信息
onMounted(() => {
  // 从localStorage获取订单信息
  const savedOrder = localStorage.getItem('checkout_order')
  if (savedOrder) {
    try {
      orderInfo.value = JSON.parse(savedOrder)
      console.log('订单信息:', orderInfo.value)
    } catch (e) {
      console.error('解析订单信息失败', e)
      ElMessage.error('获取订单信息失败')
      router.push('/cart')
    }
  } else {
    ElMessage.warning('没有待结算的订单')
    router.push('/cart')
  }
})
</script>

<template>
  <div class="checkout-container" v-if="orderInfo">
    <div class="checkout-header">
      <h2>订单确认</h2>
      <el-button type="text" @click="backToCart">返回购物车</el-button>
    </div>

    <!-- 订单商品信息 -->
    <div class="checkout-section">
      <h3>商品信息</h3>

      <!-- 单商品结算 -->
      <div v-if="orderInfo.product" class="product-info">
        <el-image :src="orderInfo.product.productImage" class="product-image" fit="cover"></el-image>
        <div class="product-details">
          <div class="product-name">{{ orderInfo.product.productName }}</div>
          <div v-if="Object.keys(orderInfo.product.specs || {}).length > 0" class="product-specs">
            规格：{{ Object.entries(orderInfo.product.specs).map(([key, value]) => `${value}`).join('、') }}
          </div>
          <div class="product-price">¥{{ (orderInfo.product.productPrice + orderInfo.product.priceAdjustment).toFixed(2) }}</div>
          <div class="product-quantity">x {{ orderInfo.quantity }}</div>
        </div>
        <div class="product-subtotal">
          <span>小计：</span>
          <span class="price">¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
        </div>
      </div>

      <!-- 多商品结算(购物车) -->
      <div v-if="orderInfo.products">
        <div v-for="(product, index) in orderInfo.products" :key="index" class="product-info">
          <el-image :src="product.productImage" class="product-image" fit="cover"></el-image>
          <div class="product-details">
            <div class="product-name">{{ product.productName }}</div>
            <div v-if="Object.keys(product.specs || {}).length > 0" class="product-specs">
              规格：{{ Object.entries(product.specs).map(([key, value]) => `${value}`).join('、') }}
            </div>
            <div class="product-price">¥{{ (product.productPrice + product.priceAdjustment).toFixed(2) }}</div>
            <div class="product-quantity">x {{ product.quantity }}</div>
          </div>
          <div class="product-subtotal">
            <span>小计：</span>
            <span class="price">¥{{ ((product.productPrice + product.priceAdjustment) * product.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 订单备注 -->
    <div class="checkout-section">
      <h3>订单备注</h3>
      <el-input
        type="textarea"
        :rows="3"
        placeholder="可以告诉我们您的特殊要求（选填）"
        v-model="remarks"
        maxlength="200"
        show-word-limit>
      </el-input>
    </div>

    <!-- 订单金额 -->
    <div class="checkout-section order-amount">
      <div class="amount-item">
        <span>商品总价：</span>
        <span>¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
      </div>
      <div class="amount-item total">
        <span>应付总额：</span>
        <span class="price">¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
      </div>
    </div>

    <!-- 提交订单 -->
    <div class="checkout-footer">
      <div class="total-payment">
        <span>应付总额：</span>
        <span class="price">¥{{ orderInfo.totalAmount.toFixed(2) }}</span>
      </div>
      <el-button
        type="primary"
        size="large"
        @click="submitOrder"
        :loading="loading">
        {{ loading ? '创建订单中...' : '提交订单' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.checkout-header h2 {
  color: #2b6fc2;
  margin: 0;
}

.checkout-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.checkout-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

/* 商品信息样式 */
.product-info {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-info:last-child {
  border-bottom: none;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  margin-right: 15px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
  color: #333;
}

.product-specs {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.product-quantity {
  color: #666;
  margin-top: 5px;
}

.product-subtotal {
  font-weight: bold;
  text-align: right;
  min-width: 120px;
}

.price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

/* 订单金额样式 */
.order-amount {
  text-align: right;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 16px;
}

.total {
  font-size: 20px;
  font-weight: bold;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px solid #f56c6c;
}

/* 提交订单栏 */
.checkout-footer {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}

.total-payment {
  font-size: 18px;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkout-container {
    padding: 10px;
  }

  .checkout-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .product-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-bottom: 10px;
    margin-right: 0;
  }

  .product-subtotal {
    text-align: left;
    margin-top: 10px;
  }
}
</style>
