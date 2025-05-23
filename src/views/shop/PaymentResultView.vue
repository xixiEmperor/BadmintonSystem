<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SuccessFilled, CircleCloseFilled, WarningFilled, InfoFilled } from '@element-plus/icons-vue'
import { getOrderDetail, queryPaymentStatus } from '@/api/pay'

const router = useRouter()
const route = useRoute()

// 支付状态
const status = ref('')
// 订单号
const orderNo = ref('')
// 订单详情
const orderDetail = ref(null)
// 失败原因
const failureReason = ref('')

// 查看订单详情
const viewOrderDetail = () => {
  router.push(`/order-detail/${orderNo.value}`)
}

// 继续购物
const continueShopping = () => {
  router.push('/shop')
}

// 重新支付
const retryPayment = () => {
  // 重新创建支付信息
  const paymentInfo = {
    orderNo: orderNo.value,
    amount: orderDetail.value?.totalAmount || 0,
    businessType: 'MALL'
  }

  localStorage.setItem('payment_info', JSON.stringify(paymentInfo))
  router.push('/payment')
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

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    const response = await getOrderDetail(orderNo.value)
    if (response.data.code === 0) {
      orderDetail.value = response.data.data
    }
  } catch (error) {
    console.error('获取订单详情失败:', error)
  }
}

// 检查支付状态
const checkPaymentStatus = async () => {
  try {
    const response = await queryPaymentStatus(orderNo.value)
    if (response.data.code === 0) {
      const paymentStatus = response.data.data.status
      if (paymentStatus === 1) { // 已支付
        status.value = 'success'
      } else {
        // 根据具体情况设置失败状态
        status.value = route.query.status || 'failed'
      }
    } else {
      status.value = 'failed'
      failureReason.value = response.message
    }
  } catch (error) {
    console.error('检查支付状态失败:', error)
    status.value = 'failed'
    failureReason.value = '网络异常，请稍后重试'
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // 从路由参数获取订单号和状态
  orderNo.value = route.query.orderNo
  status.value = route.query.status || ''

  if (!orderNo.value) {
    ElMessage.error('订单号不存在')
    router.push('/orders')
    return
  }

  // 获取订单详情
  await fetchOrderDetail()

  // 如果状态不明确，检查支付状态
  if (!status.value || status.value === 'unknown') {
    await checkPaymentStatus()
  }

  // 清除支付信息
  localStorage.removeItem('payment_info')
})
</script>

<template>
  <div class="payment-result-container">
    <!-- 支付成功 -->
    <div v-if="status === 'success'" class="result-content success">
      <div class="result-icon">
        <el-icon class="success-icon" size="80">
          <SuccessFilled />
        </el-icon>
      </div>
      <h2 class="result-title">支付成功</h2>
      <p class="result-message">恭喜您，订单支付成功！</p>

      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ orderNo }}</span>
        </div>
        <div class="info-item" v-if="orderDetail">
          <span class="label">支付金额：</span>
          <span class="value price">¥{{ orderDetail.totalAmount?.toFixed(2) }}</span>
        </div>
        <div class="info-item" v-if="orderDetail">
          <span class="label">支付时间：</span>
          <span class="value">{{ formatTime(orderDetail.payTime) }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" @click="viewOrderDetail">查看订单详情</el-button>
        <el-button @click="continueShopping">继续购物</el-button>
      </div>
    </div>

    <!-- 支付失败 -->
    <div v-else-if="status === 'failed'" class="result-content failed">
      <div class="result-icon">
        <el-icon class="failed-icon" size="80">
          <CircleCloseFilled />
        </el-icon>
      </div>
      <h2 class="result-title">支付失败</h2>
      <p class="result-message">很抱歉，您的订单支付失败，请重试</p>

      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ orderNo }}</span>
        </div>
        <div class="info-item">
          <span class="label">失败原因：</span>
          <span class="value">{{ failureReason || '支付过程中出现异常' }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" @click="retryPayment">重新支付</el-button>
        <el-button @click="viewOrderDetail">查看订单详情</el-button>
        <el-button @click="continueShopping">继续购物</el-button>
      </div>
    </div>

    <!-- 支付超时 -->
    <div v-else-if="status === 'timeout'" class="result-content timeout">
      <div class="result-icon">
        <el-icon class="timeout-icon" size="80">
          <WarningFilled />
        </el-icon>
      </div>
      <h2 class="result-title">支付超时</h2>
      <p class="result-message">支付时间已超时，请重新发起支付</p>

      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ orderNo }}</span>
        </div>
        <div class="info-item">
          <span class="label">超时时间：</span>
          <span class="value">10分钟</span>
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" @click="retryPayment">重新支付</el-button>
        <el-button @click="viewOrderDetail">查看订单详情</el-button>
        <el-button @click="continueShopping">继续购物</el-button>
      </div>
    </div>

    <!-- 支付取消 -->
    <div v-else-if="status === 'cancelled'" class="result-content cancelled">
      <div class="result-icon">
        <el-icon class="cancelled-icon" size="80">
          <InfoFilled />
        </el-icon>
      </div>
      <h2 class="result-title">支付已取消</h2>
      <p class="result-message">您已取消本次支付，可以重新发起支付</p>

      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ orderNo }}</span>
        </div>
      </div>

      <div class="action-buttons">
        <el-button type="primary" @click="retryPayment">重新支付</el-button>
        <el-button @click="viewOrderDetail">查看订单详情</el-button>
        <el-button @click="continueShopping">继续购物</el-button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-else class="result-content loading">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<style scoped>
.payment-result-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-content {
  text-align: center;
  background-color: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  width: 100%;
}

.result-icon {
  margin-bottom: 20px;
}

.success-icon {
  color: #67c23a;
}

.failed-icon {
  color: #f56c6c;
}

.timeout-icon {
  color: #e6a23c;
}

.cancelled-icon {
  color: #909399;
}

.result-title {
  font-size: 28px;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.success .result-title {
  color: #67c23a;
}

.failed .result-title {
  color: #f56c6c;
}

.timeout .result-title {
  color: #e6a23c;
}

.cancelled .result-title {
  color: #909399;
}

.result-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  line-height: 1.5;
}

.order-info {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  font-weight: 600;
}

.price {
  color: #f56c6c;
  font-size: 18px;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  min-width: 120px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-result-container {
    padding: 20px 10px;
  }

  .result-content {
    padding: 30px 20px;
  }

  .result-title {
    font-size: 24px;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons .el-button {
    width: 100%;
    max-width: 200px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}

/* 动画效果 */
.result-content {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-icon {
  animation: bounceIn 0.8s ease-out 0.2s both;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
