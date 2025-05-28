<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createPayment, queryPaymentStatus, cancelOrder } from '@/api/pay'
import { PAY_PLATFORM, PAYMENT_STATUS } from '@/api/pay'
import QRCode from 'qrcode'

const router = useRouter()

// 支付信息
const paymentInfo = ref(null)
// 选择的支付方式
const selectedPayMethod = ref(PAY_PLATFORM.WECHAT)
// 支付二维码
const paymentQrCode = ref('')
// 加载状态
const loading = ref(false)
// 检查支付状态加载
const checkingStatus = ref(false)
// 支付倒计时（10分钟）
const countdown = ref(600)
// 支付创建时间
const paymentCreateTime = ref(null)
// 支付过期时间
const paymentExpireTime = ref(null)
// 倒计时定时器
let countdownTimer = null
// 自动检查支付状态定时器
let statusCheckTimer = null
// 场地预定订单号
const reservationOrderNo = ref(null)

// 判断是否为场地预定订单
const isVenueOrder = computed(() => {
  return reservationOrderNo.value
})

// 生成二维码
const generateQRCode = async (text) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('生成二维码失败:', error)
    return null
  }
}

// 保存支付状态到本地存储
const savePaymentState = () => {
  const paymentState = {
    orderNo: paymentInfo.value?.orderNo || reservationOrderNo.value,
    paymentQrCode: paymentQrCode.value,
    paymentCreateTime: paymentCreateTime.value,
    paymentExpireTime: paymentExpireTime.value,
    selectedPayMethod: selectedPayMethod.value
  }
  localStorage.setItem('payment_state', JSON.stringify(paymentState))
}

// 从本地存储恢复支付状态
const restorePaymentState = () => {
  const savedState = localStorage.getItem('payment_state')
  if (savedState && paymentInfo.value) {
    try {
      const state = JSON.parse(savedState)
      // 只有当前订单号匹配时才恢复状态
      if (state.orderNo === paymentInfo.value.orderNo || state.orderNo === reservationOrderNo.value) {
        paymentQrCode.value = state.paymentQrCode || ''
        paymentCreateTime.value = state.paymentCreateTime ? new Date(state.paymentCreateTime) : null
        paymentExpireTime.value = state.paymentExpireTime ? new Date(state.paymentExpireTime) : null
        selectedPayMethod.value = state.selectedPayMethod || PAY_PLATFORM.WECHAT

        // 如果有有效的支付状态，检查是否还在有效期内
        if (paymentExpireTime.value) {
          const now = new Date()
          if (now < paymentExpireTime.value) {
            console.log('恢复支付状态，继续倒计时')
            startCountdown()
            startStatusCheck()
            return true
          } else {
            console.log('支付已过期，清除状态')
            clearPaymentState()
          }
        }
      }
    } catch (e) {
      console.error('恢复支付状态失败:', e)
    }
  }
  return false
}

// 清除支付状态
const clearPaymentState = () => {
  localStorage.removeItem('payment_state')
  paymentQrCode.value = ''
  paymentCreateTime.value = null
  paymentExpireTime.value = null
  countdown.value = 600
}

// 创建支付
const handleCreatePayment = async () => {
  try {
    loading.value = true

    let paymentData = {}

    if (reservationOrderNo.value) {
      paymentData = {
        orderNo: reservationOrderNo.value,
        amount: paymentInfo.value.totalAmount,
        businessType: 'RESERVATION',
        payPlatform: selectedPayMethod.value
      }
    } else {
      paymentData = {
        orderNo: paymentInfo.value.orderNo,
        amount: paymentInfo.value.amount,
        businessType: 'MALL',
        payPlatform: selectedPayMethod.value
      }
    }

    const response = await createPayment(paymentData)

    // 修复API响应检查逻辑
    if (response.data && response.data.code === 0) {
      // 获取支付链接或二维码URL
      const codeUrl = response.data.data.codeUrl || response.data.data.qrCodeUrl

      if (codeUrl) {
        // 使用真实的支付链接生成二维码
        const qrCodeImage = await generateQRCode(codeUrl)
        paymentQrCode.value = qrCodeImage || codeUrl
        console.log('paymentQrCode:', paymentQrCode.value)
      } else {
        // 如果没有返回支付链接，使用订单信息生成二维码
        const paymentUrl = `支付订单：${paymentInfo.value.orderNo}，金额：¥${paymentInfo.value.amount}`
        const qrCodeImage = await generateQRCode(paymentUrl)
        paymentQrCode.value = qrCodeImage || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      }

      // 设置支付创建时间和过期时间
      paymentCreateTime.value = new Date()
      paymentExpireTime.value = new Date(paymentCreateTime.value.getTime() + 10 * 60 * 1000) // 10分钟后过期

      console.log('支付创建时间:', paymentCreateTime.value)
      console.log('支付过期时间:', paymentExpireTime.value)
      console.log('初始倒计时:', countdown.value)

      // 保存支付状态
      savePaymentState()

      ElMessage.success('支付创建成功，请在10分钟内完成支付')

      // 开始倒计时
      startCountdown()

      // 开始自动检查支付状态
      startStatusCheck()

    } else {
      ElMessage.error(response.data?.message || '创建支付失败')
    }
  } catch (error) {
    console.error('创建支付失败:', error)
    ElMessage.error('创建支付失败，请重试')
  } finally {
    loading.value = false
  }
}

// 检查支付状态
const checkPaymentStatus = async () => {
  try {
    checkingStatus.value = true
    const response = await queryPaymentStatus(paymentInfo.value.orderNo || reservationOrderNo.value)

    if (response.data && response.data.code === 0) {
      const paymentStatus = response.data.data.status

      if (paymentStatus === PAYMENT_STATUS.SUCCESS || paymentStatus === 1) {
        // 支付成功
        ElMessage.success('支付成功！')

        // 清除定时器和支付状态
        clearTimers()
        clearPaymentState()

        // 根据订单类型跳转到不同页面
        if (isVenueOrder.value) {
          // 场地预定订单，跳转到场地预定记录界面
          router.push('/booking-history')
        } else {
          // 商品订单，跳转到订单详情页面
          router.push(`/order-detail/${paymentInfo.value.orderNo}`)
        }
      } else {
        console.log('支付状态不是已支付状态，当前状态:', paymentStatus)
        ElMessage.info(`支付尚未完成，当前状态: ${paymentStatus}，请继续支付`)
      }
    } else {
      console.error('支付状态查询失败:', response.data)
      ElMessage.error('查询支付状态失败')
    }
  } catch (error) {
    console.error('查询支付状态失败:', error)
    ElMessage.error('查询支付状态失败')
  } finally {
    checkingStatus.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  ElMessageBox.confirm('确定要取消支付吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '继续支付',
    type: 'warning',
  }).then(async () => {
    try {
      // 调用取消订单接口
      const response = await cancelOrder(reservationOrderNo.value || paymentInfo.value.orderNo)

      if (response.data && response.data.code === 0) {
        // 清除定时器和支付状态
        clearTimers()
        clearPaymentState()

        // 清除支付信息
        localStorage.removeItem('payment_state')
        localStorage.removeItem('payment_info')

        ElMessage.success('订单已取消')

        // 根据订单类型跳转到不同的订单列表页面
        if (isVenueOrder.value) {
          // 场地预定订单，跳转到场地预定记录界面
          router.push('/booking-history')
        } else {
          // 商品订单，跳转到历史商品订单界面
          router.push('/orders')
        }
      } else {
        ElMessage.error('取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  }).catch(() => {
    // 用户选择继续支付，不做任何操作
  })
}

// 开始倒计时
const startCountdown = () => {
  console.log('startCountdown 被调用')
  console.log('paymentExpireTime.value:', paymentExpireTime.value)

  // 清除之前的定时器
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  // 立即计算并设置初始倒计时值
  const now = new Date()
  const initialRemainingTime = Math.max(0, Math.floor((paymentExpireTime.value - now) / 1000))
  countdown.value = initialRemainingTime

  console.log('初始倒计时值:', countdown.value)

  countdownTimer = setInterval(() => {
    const now = new Date()
    const remainingTime = Math.max(0, Math.floor((paymentExpireTime.value - now) / 1000))

    console.log('倒计时更新:', {
      now: now,
      expireTime: paymentExpireTime.value,
      remainingTime: remainingTime,
      countdown: countdown.value
    })

    countdown.value = remainingTime

    if (countdown.value <= 0) {
      // 倒计时结束，自动取消订单
      console.log('倒计时结束，自动取消订单')
      clearTimers()
      handlePaymentExpired()
    }
  }, 1000)

  console.log('倒计时定时器已启动')
}

// 处理支付过期 - 改为自动取消订单
const handlePaymentExpired = async () => {
  try {
    // 调用取消订单接口
    await cancelOrder(reservationOrderNo.value || paymentInfo.value.orderNo)

    ElMessage.warning('支付已过期，订单已自动取消')

    // 清除支付状态和本地存储的支付信息
    clearPaymentState()
    localStorage.removeItem('payment_state')
    localStorage.removeItem('payment_info')

    // 根据订单类型跳转到不同页面
    if (isVenueOrder.value) {
      // 场地预定订单，跳转到场地预定记录界面
      router.push('/booking-history')
    }
  } catch (error) {
    console.error('自动取消订单失败:', error)
    ElMessage.error('支付过期处理失败')
  }
}

// 开始自动检查支付状态
const startStatusCheck = () => {
  statusCheckTimer = setInterval(async () => {
    try {
      const response = await queryPaymentStatus(paymentInfo.value.orderNo || reservationOrderNo.value)

      if (response.data && response.data.code === 0 && (response.data.data.status === PAYMENT_STATUS.SUCCESS || response.data.data.status === 1)) {
        // 支付成功
        console.log('自动检查发现支付成功！')
        clearTimers()
        clearPaymentState()

        ElMessage.success('支付成功！')

        // 根据订单类型跳转到不同页面
        if (isVenueOrder.value) {
          // 场地预定订单，跳转到场地预定记录界面
          router.push('/booking-history')
        } else {
          // 商品订单，跳转到订单详情页面
          router.push(`/order-detail/${paymentInfo.value.orderNo}`)
        }
      } else {
        console.log('自动检查 - 支付仍未完成，状态:', response.data?.data?.status)
      }
    } catch (error) {
      console.error('自动检查支付状态失败:', error)
    }
  }, 3000) // 每3秒检查一次
}

// 清除定时器
const clearTimers = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  if (statusCheckTimer) {
    clearInterval(statusCheckTimer)
    statusCheckTimer = null
  }
}

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 格式化过期时间显示
const formatExpireTime = () => {
  if (!paymentExpireTime.value) return ''

  const expireTime = paymentExpireTime.value
  const year = expireTime.getFullYear()
  const month = (expireTime.getMonth() + 1).toString().padStart(2, '0')
  const day = expireTime.getDate().toString().padStart(2, '0')
  const hours = expireTime.getHours().toString().padStart(2, '0')
  const minutes = expireTime.getMinutes().toString().padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 组件挂载时获取支付信息
onMounted(() => {
  // 从路由中获取订单号
  reservationOrderNo.value = router.currentRoute.value.query.orderNo

  // 从payment_order获取数据（从结算页面传递）
  let savedPaymentInfo

  if (reservationOrderNo.value) {
    paymentInfo.value = history.state.orderDetail
    console.log('paymentInfo:', paymentInfo.value)

    // 尝试恢复支付状态
    restorePaymentState()
  } else {
    // 兼容旧的payment_info格式
    savedPaymentInfo = localStorage.getItem('payment_info')
    if (savedPaymentInfo) {
      try {
        paymentInfo.value = JSON.parse(savedPaymentInfo)
        console.log('支付信息:', paymentInfo.value)

        // 尝试恢复支付状态
        restorePaymentState()
      } catch (e) {
        console.error('解析支付信息失败', e)
        ElMessage.error('获取支付信息失败')
        // 根据可能的订单类型跳转
        const orderData = savedPaymentInfo ? JSON.parse(savedPaymentInfo) : null
        if (orderData?.orderNo?.startsWith('RO')) {
          router.push('/booking-history')
        } else {
          router.push('/orders')
        }
      }
    } else {
      ElMessage.warning('没有待支付的订单')
      router.push('/orders')
    }
  }
})

// 组件卸载时清除定时器
onUnmounted(() => {
  clearTimers()
  localStorage.removeItem('payment_info')
  localStorage.removeItem('payment_state')
})
</script>

<template>
  <div class="payment-container" v-if="paymentInfo">
    <div class="payment-header">
      <h2>支付订单</h2>
      <div class="order-info">
        <span>订单号：{{ paymentInfo.orderNo || reservationOrderNo }}</span>
        <span class="amount">应付金额：<span class="price">¥{{ reservationOrderNo ? paymentInfo.totalAmount.toFixed(2) : paymentInfo.amount.toFixed(2) }}</span></span>
      </div>
      <!-- 取件码提示 -->
      <div class="pickup-code-notice" v-if="!isVenueOrder">
        <i class="el-icon-info"></i>
        <span>支付成功后将显示取件码，请妥善保管</span>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-section">
      <h3>选择支付方式</h3>
      <el-radio-group v-model="selectedPayMethod" class="payment-methods">
        <el-radio :label="PAY_PLATFORM.WECHAT" class="payment-method-item">
          <div class="payment-method">
            <div class="payment-icon wechat-icon">
              <img src="/wechat-icon.png" alt="微信支付" style="width: 50px; height: 50px;" />
            </div>
            <div class="payment-details">
              <div class="payment-name">微信支付</div>
              <div class="payment-desc">使用微信扫码支付</div>
            </div>
          </div>
        </el-radio>
        <el-radio :label="PAY_PLATFORM.ALIPAY" class="payment-method-item">
          <div class="payment-method">
            <div class="payment-icon alipay-icon">
              <img src="/alipay-icon.png" alt="支付宝" style="width: 50px; height: 50px;" />
            </div>
            <div class="payment-details">
              <div class="payment-name">支付宝</div>
              <div class="payment-desc">推荐使用支付宝，安全快捷</div>
            </div>
          </div>
        </el-radio>
      </el-radio-group>
    </div>

    <!-- 支付二维码显示区域 -->
    <div class="payment-section" v-if="paymentQrCode">
      <h3>扫码支付</h3>
      <div class="qr-code-container">
        <div class="qr-code">
          <el-image :src="paymentQrCode" fit="contain" class="qr-image">
            <template #error>
              <div class="qr-error">
                <i class="el-icon-picture-outline"></i>
                <p>二维码加载失败</p>
              </div>
            </template>
          </el-image>
        </div>
        <div class="qr-tips">
          <p>请使用{{ selectedPayMethod === PAY_PLATFORM.ALIPAY ? '支付宝' : '微信' }}扫描二维码完成支付</p>
          <p class="amount-tip">支付金额：<span class="price">¥{{ reservationOrderNo ? paymentInfo.totalAmount.toFixed(2) : paymentInfo.amount.toFixed(2) }}</span></p>
        </div>
      </div>

      <!-- 支付状态检查 -->
      <div class="payment-status">
        <el-button type="primary" @click="checkPaymentStatus" :loading="checkingStatus">
          {{ checkingStatus ? '检查支付状态中...' : '我已完成支付' }}
        </el-button>
        <el-button @click="cancelPayment">取消支付</el-button>
      </div>
    </div>

    <!-- 支付按钮 -->
    <div class="payment-footer" v-if="!paymentQrCode">
      <div class="payment-amount">
        <span>支付金额：</span>
        <span class="price">¥{{ reservationOrderNo ? paymentInfo.totalAmount.toFixed(2) : paymentInfo.amount.toFixed(2) }}</span>
      </div>
      <div class="payment-buttons">
        <el-button
          type="primary"
          size="large"
          @click="handleCreatePayment"
          :loading="loading"
          :disabled="!selectedPayMethod">
          {{ loading ? '正在创建支付...' : '立即支付' }}
        </el-button>
      </div>
    </div>

    <!-- 支付倒计时 -->
    <div class="payment-countdown" v-if="paymentQrCode && countdown > 0">
      <div class="countdown-info">
        <p>支付剩余时间：<span class="countdown-time">{{ formatTime(countdown) }}</span></p>
        <p class="expire-time">支付将于 {{ formatExpireTime() }} 过期</p>
      </div>
      <el-progress :percentage="(countdown / 600) * 100" :show-text="false" :stroke-width="8"></el-progress>
    </div>

    <!-- 支付过期提示 -->
    <div class="payment-expired" v-if="paymentQrCode && countdown <= 0">
      <div class="expired-content">
        <i class="el-icon-warning-outline"></i>
        <h3>支付已过期</h3>
        <p>订单支付时间已超过10分钟，订单状态已更新为已过期</p>
        <el-button type="primary" @click="router.push('/orders')">返回订单列表</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.payment-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.payment-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}

.amount {
  font-weight: bold;
}

.price {
  color: #ffd700;
  font-size: 20px;
  font-weight: bold;
}

.pickup-code-notice {
  margin-top: 15px;
  padding: 15px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.pickup-code-notice::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ffd700, #fff, #ffd700);
  animation: glow 2s infinite;
}

@keyframes glow {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

.pickup-code-notice i {
  font-size: 20px;
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.payment-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.payment-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.payment-method-item {
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 0;
  transition: all 0.3s ease;
  min-height: 80px;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

.payment-method-item:hover {
  border-color: #409eff;
  background-color: #f8f9ff;
}

.payment-method-item.is-checked {
  border-color: #409eff;
  background-color: #f0f7ff;
}

.payment-method-item .el-radio__input {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  margin: 0;
}

.payment-method-item .el-radio__label {
  width: 100%;
  padding: 20px 20px 20px 60px;
  margin: 0;
  display: block;
  min-height: 80px;
  box-sizing: border-box;
}

.payment-method {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 40px;
}

.payment-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
  color: white;
  flex-shrink: 0;
}

.alipay-icon {
  background: linear-gradient(135deg, #1677ff, #00a6fb);
}

.wechat-icon {
  background: linear-gradient(135deg, #07c160, #00d976);
}

.payment-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}

.payment-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
  line-height: 1.2;
}

.payment-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.2;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qr-code {
  width: 200px;
  height: 200px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 100%;
  height: 100%;
}

.qr-error {
  color: #999;
  text-align: center;
}

.qr-error i {
  font-size: 48px;
  margin-bottom: 10px;
  display: block;
}

.qr-tips {
  margin-bottom: 20px;
}

.qr-tips p {
  margin: 5px 0;
  color: #666;
}

.amount-tip {
  font-size: 18px;
  font-weight: bold;
}

.payment-status {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.payment-footer {
  background-color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #f0f0f0;
  position: sticky;
  bottom: 0;
}

.payment-amount {
  font-size: 18px;
  font-weight: bold;
}

.payment-buttons {
  display: flex;
  gap: 15px;
  align-items: center;
}

.payment-countdown {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  margin-top: 20px;
}

.countdown-time {
  color: #e17055;
  font-weight: bold;
  font-size: 18px;
}

.countdown-info {
  margin-bottom: 20px;
}

.expire-time {
  color: #999;
  font-size: 14px;
}

.payment-expired {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  padding: 30px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(255, 77, 79, 0.1);
}

.expired-content {
  margin-bottom: 20px;
}

.expired-content i {
  font-size: 48px;
  margin-bottom: 15px;
  display: block;
  color: #ff4d4f;
}

.expired-content h3 {
  margin: 0 0 15px 0;
  font-size: 20px;
  font-weight: 600;
  color: #ff4d4f;
}

.expired-content p {
  margin: 0 0 25px 0;
  color: #666;
  font-size: 16px;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .payment-container {
    padding: 10px;
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .payment-footer {
    flex-direction: column;
    gap: 15px;
  }

  .payment-status {
    flex-direction: column;
  }

  .qr-code {
    width: 150px;
    height: 150px;
  }
}
</style>
