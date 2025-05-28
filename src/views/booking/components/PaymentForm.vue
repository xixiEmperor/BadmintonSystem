<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import {
  createPayment,
  queryPaymentStatus,
  PAYMENT_STATUS,
  BUSINESS_TYPE
} from '@/api/pay'

// Props
const props = defineProps({
  orderInfo: {
    type: Object,
    required: true
  },
  autoStartPayment: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['payment-success', 'payment-failed', 'payment-timeout', 'cancel'])

// 支付相关状态
const selectedPaymentMethod = ref('alipay')
const paymentLoading = ref(false)
const qrCodeUrl = ref('')
const paymentStatus = ref('') // 'pending', 'success', 'failed', 'timeout'
const countdown = ref(600) // 10分钟倒计时
const paymentTimer = ref(null)
const statusCheckTimer = ref(null)

// 计算属性
const showQRCode = computed(() => {
  return selectedPaymentMethod.value && (qrCodeUrl.value || paymentLoading.value)
})

const paymentStatusText = computed(() => {
  switch (paymentStatus.value) {
    case PAYMENT_STATUS.SUCCESS:
      return '支付成功！正在跳转...'
    case 'failed':
      return '支付失败，请重试'
    case 'timeout':
      return '支付超时，订单已取消'
    default:
      return '等待支付中...'
  }
})

// 选择支付方式
const selectPaymentMethod = (method) => {
  if (paymentStatus.value === PAYMENT_STATUS.NOTPAY && qrCodeUrl.value) {
    ElMessage.warning('支付进行中，无法切换支付方式')
    return
  }

  selectedPaymentMethod.value = method
  if (props.autoStartPayment) {
    generatePaymentQRCode()
  }
}

// 生成支付二维码
const generatePaymentQRCode = async () => {
  if (!props.orderInfo.orderNo) {
    ElMessage.error('订单信息不完整，无法生成支付二维码')
    return
  }

  paymentLoading.value = true
  paymentStatus.value = PAYMENT_STATUS.NOTPAY

  try {
    // 调用真实的支付API - 使用pay.js中的接口
    const response = await createPayment({
      orderNo: props.orderInfo.orderNo,
      amount: props.orderInfo.totalAmount,
      businessType: BUSINESS_TYPE.RESERVATION // 预约业务类型
    })

    if (response.data.code === 0) {
      // 获取支付二维码URL
      qrCodeUrl.value = response.data.data.qrCodeUrl

      // 开始倒计时
      startCountdown()

      // 开始检查支付状态
      startPaymentStatusCheck()

      ElMessage.success('支付二维码已生成，请扫码支付')
    } else {
      throw new Error(response.data.message || '生成支付二维码失败')
    }
  } catch (error) {
    console.error('生成支付二维码失败:', error)
    ElMessage.error(error.message || '生成支付二维码失败，请重试')
    paymentStatus.value = PAYMENT_STATUS.NOTPAY
  } finally {
    paymentLoading.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
  }

  countdown.value = 300 // 5分钟
  paymentTimer.value = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      clearInterval(paymentTimer.value)
      handlePaymentTimeout()
    }
  }, 1000)
}

// 开始检查支付状态
const startPaymentStatusCheck = () => {
  if (statusCheckTimer.value) {
    clearInterval(statusCheckTimer.value)
  }

  statusCheckTimer.value = setInterval(async () => {
    await checkPaymentStatus()
  }, 3000) // 每3秒检查一次
}

// 检查支付状态
const checkPaymentStatus = async () => {
  if (!props.orderInfo.orderNo) return

  try {
    const response = await queryPaymentStatus(props.orderInfo.orderNo)

    if (response.data.code === 0) {
      const status = response.data.data.status

      if (status === PAYMENT_STATUS.SUCCESS) {
        handlePaymentSuccess()
      } else if (status === 'failed') {
        handlePaymentFailed()
      }
      // 其他状态继续等待
    }
  } catch (error) {
    console.error('检查支付状态失败:', error)
  }
}

// 处理支付成功
const handlePaymentSuccess = () => {
  paymentStatus.value = PAYMENT_STATUS.SUCCESS
  clearTimers()

  ElMessage.success('支付成功！')

  setTimeout(() => {
    emit('payment-success', {
      orderNo: props.orderInfo.orderNo,
      paymentMethod: selectedPaymentMethod.value,
      amount: props.orderInfo.totalAmount
    })
  }, 1500)
}

// 处理支付失败
const handlePaymentFailed = () => {
  paymentStatus.value = 'failed'
  clearTimers()

  ElMessage.error('支付失败，请重试')
  emit('payment-failed', {
    orderNo: props.orderInfo.orderNo,
    paymentMethod: selectedPaymentMethod.value
  })
}

// 处理支付超时
const handlePaymentTimeout = () => {
  paymentStatus.value = 'timeout'
  clearTimers()

  ElMessage.warning('支付超时，订单已取消')
  emit('payment-timeout', {
    orderNo: props.orderInfo.orderNo
  })
}

// 清除定时器
const clearTimers = () => {
  if (paymentTimer.value) {
    clearInterval(paymentTimer.value)
    paymentTimer.value = null
  }
  if (statusCheckTimer.value) {
    clearInterval(statusCheckTimer.value)
    statusCheckTimer.value = null
  }
}

// 重新支付
const retryPayment = () => {
  paymentStatus.value = ''
  qrCodeUrl.value = ''
  generatePaymentQRCode()
}

// 取消支付
const cancelPayment = () => {
  clearTimers()
  emit('cancel')
}

// 处理图片加载错误
const handleImageError = (event) => {
  // 使用默认图标替换
  event.target.style.display = 'none'
}

// 组件挂载时自动开始支付
onMounted(() => {
  if (props.autoStartPayment) {
    generatePaymentQRCode()
  }
})

// 组件卸载时清除定时器
onUnmounted(() => {
  clearTimers()
})

// 暴露方法给父组件
defineExpose({
  generatePaymentQRCode,
  retryPayment,
  cancelPayment,
  selectedPaymentMethod,
  paymentStatus
})
</script>

<template>
  <div class="payment-form">
    <!-- 订单信息摘要 -->
    <div class="order-summary-section">
      <h4>订单信息</h4>
      <div class="order-summary-card">
        <div class="summary-item">
          <span class="label">订单号：</span>
          <span class="value">{{ orderInfo.orderNo || '待生成' }}</span>
        </div>
        <div class="summary-item">
          <span class="label">场地：</span>
          <span class="value">{{ orderInfo.venueName }}</span>
        </div>
        <div class="summary-item">
          <span class="label">日期：</span>
          <span class="value">{{ orderInfo.reservationDate }}</span>
        </div>
        <div class="summary-item">
          <span class="label">时间：</span>
          <span class="value">{{ orderInfo.startTime }} - {{ orderInfo.endTime }}</span>
        </div>
        <div class="summary-item">
          <span class="label">预约人：</span>
          <span class="value">{{ orderInfo.contactName }}</span>
        </div>
        <div class="summary-item">
          <span class="label">联系电话：</span>
          <span class="value">{{ orderInfo.contactPhone }}</span>
        </div>
        <div class="summary-item total">
          <span class="label">应付金额：</span>
          <span class="value price">¥{{ orderInfo.totalAmount }}</span>
        </div>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-method-section">
      <h4>选择支付方式</h4>
      <div class="payment-methods">
        <div
          class="payment-option"
          :class="{ active: selectedPaymentMethod === 'alipay' }"
          @click="selectPaymentMethod('alipay')"
        >
          <div class="payment-icon">
            <img src="/alipay-icon.png" alt="支付宝" @error="handleImageError" />
          </div>
          <div class="payment-info">
            <div class="payment-name">支付宝</div>
            <div class="payment-desc">推荐使用支付宝扫码支付</div>
          </div>
          <div class="payment-radio">
            <el-radio v-model="selectedPaymentMethod" label="alipay" />
          </div>
        </div>

        <div
          class="payment-option"
          :class="{ active: selectedPaymentMethod === 'wechat' }"
          @click="selectPaymentMethod('wechat')"
        >
          <div class="payment-icon">
            <img src="/wechat-icon.png" alt="微信支付" @error="handleImageError" />
          </div>
          <div class="payment-info">
            <div class="payment-name">微信支付</div>
            <div class="payment-desc">使用微信扫码支付</div>
          </div>
          <div class="payment-radio">
            <el-radio v-model="selectedPaymentMethod" label="wechat" />
          </div>
        </div>
      </div>
    </div>

    <!-- 支付二维码区域 -->
    <div class="payment-qrcode-section" v-if="showQRCode">
      <h4>扫码支付</h4>
      <div class="qrcode-container">
        <div class="qrcode-wrapper">
          <div v-if="paymentLoading" class="qrcode-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <p>正在生成支付二维码...</p>
          </div>
          <div v-else-if="qrCodeUrl" class="qrcode-image">
            <img :src="qrCodeUrl" alt="支付二维码" />
          </div>
          <div v-else class="qrcode-placeholder">
            <el-icon><QrCode /></el-icon>
            <p>支付二维码</p>
          </div>
        </div>

        <div class="payment-instructions">
          <div class="instruction-title">
            请使用{{ selectedPaymentMethod === 'alipay' ? '支付宝' : '微信' }}扫描二维码完成支付
          </div>
          <div class="instruction-steps">
            <div class="step">1. 打开{{ selectedPaymentMethod === 'alipay' ? '支付宝' : '微信' }}APP</div>
            <div class="step">2. 点击扫一扫功能</div>
            <div class="step">3. 扫描上方二维码</div>
            <div class="step">4. 确认支付金额并完成支付</div>
          </div>
        </div>
      </div>

      <!-- 支付状态 -->
      <div class="payment-status" v-if="paymentStatus">
        <el-alert
          :title="paymentStatusText"
          :type="paymentStatus === PAYMENT_STATUS.SUCCESS ? 'success' : paymentStatus === 'failed' ? 'error' : 'info'"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 支付倒计时 -->
      <div class="payment-countdown" v-if="countdown > 0">
        <el-progress
          :percentage="(countdown / 300) * 100"
          :show-text="false"
          :stroke-width="6"
          color="#409eff"
        />
        <p class="countdown-text">
          支付剩余时间：{{ Math.floor(countdown / 60) }}分{{ countdown % 60 }}秒
        </p>
      </div>
    </div>

    <!-- 支付说明 -->
    <div class="payment-notice">
      <h4>支付说明</h4>
      <ul class="notice-list">
        <li>支付时限为5分钟，超时订单将自动取消</li>
        <li>支付成功后，系统将自动确认您的预约</li>
        <li>如遇支付问题，请联系客服：400-123-4567</li>
        <li>支付完成后，请保留支付凭证</li>
      </ul>
    </div>
  </div>
</template>

<style lang="less" scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

h4 {
  margin: 0 0 16px 0;
  color: #2b6fc2;
  font-size: 16px;
  font-weight: 600;
}

.order-summary-section {
  .order-summary-card {
    background: linear-gradient(135deg, #f8f9ff 0%, #f0f7ff 100%);
    border: 1px solid #e1ecff;
    border-radius: 12px;
    padding: 20px;
  }

  .summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }

    &.total {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed #d1e7ff;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .label {
    color: #666;
    font-weight: 500;
  }

  .value {
    color: #333;
    font-weight: 500;

    &.price {
      color: #f56c6c;
      font-size: 20px;
      font-weight: 700;
    }
  }
}

.payment-method-section {
  .payment-methods {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .payment-option {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 2px solid #e8e8e8;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #409eff;
      background-color: #f8fbff;
    }

    &.active {
      border-color: #409eff;
      background-color: #ecf5ff;
    }
  }

  .payment-icon {
    width: 48px;
    height: 48px;
    margin-right: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .payment-info {
    flex: 1;

    .payment-name {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .payment-desc {
      font-size: 14px;
      color: #666;
    }
  }

  .payment-radio {
    margin-left: 16px;
  }
}

.payment-qrcode-section {
  .qrcode-container {
    display: flex;
    gap: 32px;
    align-items: flex-start;
  }

  .qrcode-wrapper {
    width: 240px;
    height: 240px;
    border: 1px solid #e8e8e8;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    flex-shrink: 0;

    .qrcode-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #666;

      .el-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    .qrcode-image img {
      width: 200px;
      height: 200px;
    }

    .qrcode-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #999;

      .el-icon {
        font-size: 48px;
        margin-bottom: 8px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }

  .payment-instructions {
    flex: 1;

    .instruction-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 16px;
    }

    .instruction-steps {
      .step {
        margin-bottom: 8px;
        color: #666;
        font-size: 14px;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}

.payment-status {
  margin-top: 16px;
}

.payment-countdown {
  margin-top: 16px;
  text-align: center;

  .countdown-text {
    margin: 8px 0 0 0;
    color: #666;
    font-size: 14px;
  }
}

.payment-notice {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 12px;
  padding: 20px;

  .notice-list {
    margin: 0;
    padding-left: 20px;

    li {
      margin-bottom: 8px;
      color: #d46b08;
      line-height: 1.5;
      font-size: 14px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .qrcode-container {
    flex-direction: column;
    align-items: center;

    .qrcode-wrapper {
      width: 200px;
      height: 200px;
    }

    .payment-instructions {
      text-align: center;
    }
  }

  .payment-methods {
    .payment-option {
      flex-direction: column;
      text-align: center;

      .payment-icon {
        margin-right: 0;
        margin-bottom: 12px;
      }

      .payment-radio {
        margin-left: 0;
        margin-top: 12px;
      }
    }
  }

  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
