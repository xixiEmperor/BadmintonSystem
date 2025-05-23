<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 订单信息
const orderInfo = ref(null)

// 支付方式
const paymentMethod = ref('alipay')

// 订单备注
const remarks = ref('')

// 提交订单
const submitOrder = () => {
  ElMessageBox.confirm('确认提交订单并前往支付？', '提交订单', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    // 生成订单号
    const orderNo = 'ORD' + Date.now()

    // 准备支付页面需要的订单数据
    const paymentOrder = {
      orderNo: orderNo,
      products: orderInfo.value.products || [orderInfo.value.product],
      totalAmount: orderInfo.value.totalAmount,
      paymentMethod: paymentMethod.value,
      remarks: remarks.value,
      createTime: new Date().toISOString()
    }

    // 存储订单信息到localStorage供支付页面使用
    localStorage.setItem('payment_order', JSON.stringify(paymentOrder))

    ElMessage.success('订单提交成功，即将跳转到支付页面')

    // 跳转到支付页面
    setTimeout(() => {
      router.push('/payment')
    }, 1000)
  })
}

// 返回商城
const backToShop = () => {
  router.push('/shop')
}

// 组件挂载时获取订单信息
onMounted(() => {
  // 从localStorage获取订单信息
  const savedOrder = localStorage.getItem('checkout_order')
  if (savedOrder) {
    try {
      orderInfo.value = JSON.parse(savedOrder)
      console.log(orderInfo.value)
    } catch (e) {
      console.error('解析订单信息失败', e)
      ElMessage.error('获取订单信息失败')
      router.push('/shop')
    }
  } else {
    ElMessage.warning('没有待结算的订单')
    router.push('/shop')
  }
})
</script>

<template>
  <div class="checkout-container" v-if="orderInfo">
    <div class="checkout-header">
      <h2>订单结算</h2>
      <el-button type="text" @click="backToShop">返回商城</el-button>
    </div>

    <!-- 订单商品信息 -->
    <div class="checkout-section">
      <h3>商品信息</h3>

      <!-- 单商品结算 -->
      <div v-if="orderInfo.product" class="product-info">
        <el-image :src="orderInfo.product.image" class="product-image" fit="cover"></el-image>
        <div class="product-details">
          <div class="product-name">{{ orderInfo.product.name }} ({{ Object.entries(orderInfo.product.specifications).map(([key, value]) => `${value}`).join(', ') }})</div>
          <div class="product-price">¥{{ (orderInfo.product.actualPrice || orderInfo.product.productPrice).toFixed(2) }}</div>
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
          <el-image :src="product.image" class="product-image" fit="cover"></el-image>
          <div class="product-details">
            <div class="product-name">{{ product.name }}</div>
            <div class="product-price">¥{{ (product.actualPrice || product.productPrice).toFixed(2) }}</div>
            <div class="product-quantity">x {{ product.quantity }}</div>
          </div>
          <div class="product-subtotal">
            <span>小计：</span>
            <span class="price">¥{{ ((product.actualPrice || product.productPrice) * product.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="checkout-section">
      <h3>支付方式</h3>
      <el-radio-group v-model="paymentMethod" class="payment-methods">
        <el-radio label="alipay">
          <div class="payment-method">
            <img src="https://via.placeholder.com/40?text=Alipay" alt="支付宝" />
            <span>支付宝</span>
          </div>
        </el-radio>
        <el-radio label="wechat">
          <div class="payment-method">
            <img src="https://via.placeholder.com/40?text=WeChat" alt="微信支付" />
            <span>微信支付</span>
          </div>
        </el-radio>
      </el-radio-group>
    </div>

    <!-- 订单备注 -->
    <div class="checkout-section">
      <h3>订单备注</h3>
      <el-input type="textarea" :rows="2" placeholder="可以告诉我们您的特殊要求" v-model="remarks">
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
      <el-button type="primary" size="large" @click="submitOrder">提交订单</el-button>
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
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.checkout-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
}

/* 商品信息样式 */
.product-info {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  margin-right: 15px;
}

.product-details {
  flex: 1;
}

.product-name {
  font-size: 16px;
  margin-bottom: 5px;
}

.product-price {
  color: #f56c6c;
  font-weight: bold;
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

/* 支付方式样式 */
.payment-methods {
  display: flex;
  flex-wrap: wrap;
}

.payment-method {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.payment-method img,
.payment-method .el-icon {
  margin-right: 5px;
}

/* 订单金额样式 */
.order-amount {
  text-align: right;
}

.amount-item {
  margin-bottom: 10px;
}

.total {
  font-size: 18px;
  font-weight: bold;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

/* 提交订单栏 */
.checkout-footer {
  position: sticky;
  bottom: 0;
  background-color: #fff;
  padding: 15px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.total-payment {
  margin-right: 20px;
  font-size: 16px;
  font-weight: bold;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkout-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .total-payment {
    margin-bottom: 15px;
    margin-right: 0;
  }
}
</style>
