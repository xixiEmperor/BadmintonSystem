<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SuccessFilled, CircleCloseFilled, WarningFilled } from '@element-plus/icons-vue'
import { getOrderDetail, queryPaymentStatus, cancelOrder as cancelOrderApi } from '@/api/pay'
import { ORDER_STATUS, PAYMENT_STATUS, PAY_PLATFORM } from '@/api/pay'

const router = useRouter()
const route = useRoute()

// 订单详情
const orderDetail = ref(null)
// 支付详情
const paymentDetail = ref(null)
// 加载状态
const loading = ref(false)

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true

    const orderNo = route.params.orderNo
    if (!orderNo) {
      ElMessage.error('订单号不存在')
      router.push('/orders')
      return
    }

    const response = await getOrderDetail(orderNo)

    if (response.data.code === 0) {
      orderDetail.value = response.data.data

      // 如果订单已支付，获取支付详情
      if (orderDetail.value.status === ORDER_STATUS.PAID) {
        await fetchPaymentDetail(orderNo)
      }
    } else {
      ElMessage.error(response.message || '获取订单详情失败')
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 获取支付详情
const fetchPaymentDetail = async (orderNo) => {
  try {
    const response = await queryPaymentStatus(orderNo)
    if (response.data.code === 0) {
      paymentDetail.value = response.data.data
    }
  } catch (error) {
    console.error('获取支付详情失败:', error)
  }
}

// 支付订单
const payOrder = () => {
  const paymentInfo = {
    orderNo: orderDetail.value.orderNo,
    amount: orderDetail.value.totalPrice,
    businessType: 'SHOP_ORDER'
  }

  localStorage.setItem('payment_info', JSON.stringify(paymentInfo))
  router.push('/payment')
}

// 取消订单
const cancelOrder = () => {
  ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await cancelOrderApi(orderDetail.value.orderNo)

      if (response.data.code === 0) {
        ElMessage.success('订单取消成功')
        // 刷新订单详情
        await fetchOrderDetail()
      } else {
        ElMessage.error(response.message || '取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 确认收货
const confirmReceipt = () => {
  ElMessageBox.confirm('确定已收到商品吗？', '确认收货', {
    confirmButtonText: '确认收货',
    cancelButtonText: '取消',
    type: 'info',
  }).then(() => {
    ElMessage.success('确认收货成功')
    // 刷新订单详情
    fetchOrderDetail()
  }).catch(() => {
    // 用户取消操作
  })
}

// 返回
const goBack = () => {
  router.go(-1)
}

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case ORDER_STATUS.UNPAID:
      return 'warning'
    case ORDER_STATUS.PAID:
      return 'success'
    case ORDER_STATUS.CANCELLED:
      return 'danger'
    case ORDER_STATUS.COMPLETED:
      return 'success'
    case ORDER_STATUS.CLOSED:
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case ORDER_STATUS.UNPAID:
      return '待支付'
    case ORDER_STATUS.PAID:
      return '已支付'
    case ORDER_STATUS.CANCELLED:
      return '已取消'
    case ORDER_STATUS.COMPLETED:
      return '已完成'
    case ORDER_STATUS.CLOSED:
      return '已关闭'
    default:
      return '未知状态'
  }
}

// 获取支付方式文本
const getPaymentMethodText = (platform) => {
  switch (platform) {
    case PAY_PLATFORM.ALIPAY:
      return '支付宝'
    case PAY_PLATFORM.WECHAT:
      return '微信支付'
    default:
      return '未知'
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 组件挂载时获取数据
onMounted(() => {
  fetchOrderDetail()
})
</script>

<template>
  <div class="order-detail-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 订单详情 -->
    <div v-else-if="orderDetail" class="order-detail">
      <!-- 订单状态 -->
      <div class="order-status-section">
        <div class="status-icon">
          <el-icon v-if="orderDetail.status === ORDER_STATUS.PAID" class="success-icon" size="60">
            <SuccessFilled />
          </el-icon>
          <el-icon v-else-if="orderDetail.status === ORDER_STATUS.CANCELLED" class="error-icon" size="60">
            <CircleCloseFilled />
          </el-icon>
          <el-icon v-else class="warning-icon" size="60">
            <WarningFilled />
          </el-icon>
        </div>
        <div class="status-info">
          <h2>{{ getStatusText(orderDetail.status) }}</h2>
          <p v-if="orderDetail.status === ORDER_STATUS.PAID">您的订单已支付成功</p>
          <p v-else-if="orderDetail.status === ORDER_STATUS.CANCELLED">订单已取消</p>
          <p v-else-if="orderDetail.status === ORDER_STATUS.UNPAID">请尽快完成支付</p>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="order-info-section">
        <h3>订单信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">订单号：</span>
            <span class="value">{{ orderDetail.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">下单时间：</span>
            <span class="value">{{ formatTime(orderDetail.createTime) }}</span>
          </div>
          <div class="info-item" v-if="orderDetail.payTime">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatTime(orderDetail.payTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单状态：</span>
            <el-tag :type="getStatusType(orderDetail.status)">
              {{ getStatusText(orderDetail.status) }}
            </el-tag>
          </div>
          <div class="info-item" v-if="orderDetail.remarks">
            <span class="label">订单备注：</span>
            <span class="value">{{ orderDetail.remarks }}</span>
          </div>
          <!-- 取件码显示 -->
          <div v-if="orderDetail.status === ORDER_STATUS.UNPAID" class="info-item pickup-code-item">
            <span class="label">取件码：</span>
            <span v-if="orderDetail.status === ORDER_STATUS.PAID" class="pickup-code">
              {{ orderDetail.pickupCode || 'WHUT2024' }}
            </span>
            <span class="pickup-code-pending">
              支付成功后显示取件码
            </span>
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="products-section">
        <h3>商品信息</h3>
        <div class="product-list">
          <div v-for="(product, index) in orderDetail.orderItemList" :key="index" class="product-item">
            <el-image :src="product.productImage" class="product-image" fit="cover"></el-image>
            <div class="product-details">
              <div class="product-name">{{ product.productName }}</div>
              <div v-if="product.specs" class="product-specs">
                规格：{{ Object.entries(product.specs).map(([key, value]) => `${value}`).join('、') }}
              </div>
              <div class="product-price">¥{{ product.currentUnitPrice.toFixed(2) }}</div>
            </div>
            <div class="product-quantity">x{{ product.quantity }}</div>
            <div class="product-subtotal">
              ¥{{ (product.currentUnitPrice * product.quantity).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 支付信息 -->
      <div class="payment-section" v-if="paymentDetail">
        <h3>支付信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">支付方式：</span>
            <span class="value">{{ getPaymentMethodText(paymentDetail.payPlatform) }}</span>
          </div>
          <div class="info-item" v-if="paymentDetail.payTime">
            <span class="label">支付时间：</span>
            <span class="value">{{ formatTime(paymentDetail.payTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">支付状态：</span>
            <el-tag :type="paymentDetail.status === PAYMENT_STATUS.SUCCESS ? 'success' : 'warning'">
              {{ paymentDetail.status === PAYMENT_STATUS.SUCCESS ? '已支付' : '未支付' }}
            </el-tag>
          </div>
        </div>
      </div>

      <!-- 金额明细 -->
      <div class="amount-section">
        <h3>金额明细</h3>
        <div class="amount-details">
          <div class="amount-item">
            <span>商品总价：</span>
            <span>¥{{ orderDetail.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="amount-item total">
            <span>实付金额：</span>
            <span class="total-price">¥{{ orderDetail.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button @click="goBack">返回</el-button>
        <el-button
          v-if="orderDetail.status === ORDER_STATUS.UNPAID"
          type="primary"
          @click="payOrder">
          立即支付
        </el-button>
        <el-button
          v-if="orderDetail.status === ORDER_STATUS.UNPAID"
          type="danger"
          @click="cancelOrder">
          取消订单
        </el-button>
        <el-button
          v-if="orderDetail.status === ORDER_STATUS.PAID"
          type="success"
          @click="confirmReceipt">
          确认收货
        </el-button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else class="error-container">
      <el-empty description="订单不存在或已被删除">
        <el-button type="primary" @click="goBack">返回</el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped>
.order-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  padding: 40px 0;
  text-align: center;
}

.order-detail {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
}

/* 订单状态区域 */
.order-status-section {
  background: linear-gradient(135deg, #4f80ff 0%, #1e40af 100%);
  color: white;
  padding: 30px;
  text-align: center;
}

.status-icon {
  margin-bottom: 15px;
}

.success-icon {
  color: #67c23a;
}

.error-icon {
  color: #f56c6c;
}

.warning-icon {
  color: #e6a23c;
}

.status-info h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.status-info p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

/* 信息区域 */
.order-info-section,
.products-section,
.payment-section,
.amount-section {
  padding: 25px;
  border-bottom: 1px solid #f0f0f0;
}

.order-info-section h3,
.products-section h3,
.payment-section h3,
.amount-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  color: #666;
  font-weight: 500;
  min-width: 100px;
}

.value {
  color: #333;
  font-weight: 600;
}

/* 取件码样式 */
.pickup-code-item {
  grid-column: 1 / -1; /* 占满整行 */
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  border-radius: 12px;
  border: 3px solid #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
  position: relative;
  overflow: hidden;
}

.pickup-code-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #28a745, #20c997, #28a745);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.pickup-code {
  color: #155724;
  font-weight: bold;
  font-size: 24px;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  letter-spacing: 3px;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  padding: 15px 20px;
  border-radius: 8px;
  border: 2px solid #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
  display: inline-block;
  position: relative;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.pickup-code::before {
  content: '🎫';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
}

.pickup-code-pending {
  color: #6c757d;
  font-style: italic;
  font-size: 16px;
  background-color: #f8f9fa;
  padding: 12px 16px;
  border-radius: 6px;
  border: 2px dashed #dee2e6;
}

/* 商品列表 */
.product-list {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f5f5f5;
}

.product-item:last-child {
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
  font-size: 14px;
  min-width: 80px;
  text-align: center;
}

.product-subtotal {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
  min-width: 100px;
  text-align: right;
}

/* 金额明细 */
.amount-details {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.amount-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 16px;
}

.amount-item:last-child {
  margin-bottom: 0;
}

.amount-item.total {
  font-size: 18px;
  font-weight: bold;
  padding-top: 15px;
  border-top: 2px solid #f56c6c;
  margin-top: 15px;
}

.total-price {
  color: #f56c6c;
  font-size: 20px;
}

/* 操作按钮 */
.action-section {
  padding: 25px;
  text-align: right;
  background-color: #f8f9fa;
}

.action-section .el-button {
  margin-left: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-detail-container {
    padding: 10px;
  }

  .order-status-section {
    padding: 20px;
  }

  .order-info-section,
  .products-section,
  .payment-section,
  .amount-section {
    padding: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-image {
    margin-bottom: 10px;
    margin-right: 0;
  }

  .product-quantity,
  .product-subtotal {
    text-align: left;
    margin-top: 5px;
  }

  .action-section {
    text-align: center;
  }

  .action-section .el-button {
    margin: 5px;
  }
}
</style>
