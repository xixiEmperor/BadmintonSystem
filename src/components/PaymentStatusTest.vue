<template>
  <div class="payment-status-test">
    <h3>支付状态测试</h3>

    <div class="input-section">
      <el-input
        v-model="orderNo"
        placeholder="请输入订单号"
        style="width: 300px; margin-right: 10px;"
      />
      <el-button type="primary" @click="checkStatus" :loading="loading">查询支付状态</el-button>
    </div>

    <div v-if="result" class="result-section">
      <h4>查询结果：</h4>
      <div class="result-content">
        <pre>{{ JSON.stringify(result, null, 2) }}</pre>
      </div>
    </div>

    <div v-if="error" class="error-section">
      <h4>错误信息：</h4>
      <p style="color: red;">{{ error }}</p>
    </div>

    <div class="status-info">
      <h4>支付状态说明：</h4>
      <ul>
        <li>PAYMENT_STATUS.UNPAID = {{ PAYMENT_STATUS.UNPAID }} (未支付)</li>
        <li>PAYMENT_STATUS.PAID = {{ PAYMENT_STATUS.PAID }} (已支付)</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { queryPaymentStatus, PAYMENT_STATUS } from '@/api/pay'

const orderNo = ref('')
const result = ref(null)
const error = ref('')
const loading = ref(false)

const checkStatus = async () => {
  if (!orderNo.value) {
    ElMessage.warning('请输入订单号')
    return
  }

  try {
    loading.value = true
    error.value = ''
    result.value = null

    console.log('测试查询支付状态，订单号:', orderNo.value)
    const response = await queryPaymentStatus(orderNo.value)

    console.log('测试查询响应:', response)

    result.value = {
      原始响应: response,
      响应代码: response.data?.code,
      响应消息: response.data?.message,
      支付数据: response.data?.data,
      支付状态: response.data?.data?.status,
      状态类型: typeof response.data?.data?.status,
      是否已支付: response.data?.data?.status === PAYMENT_STATUS.PAID,
      严格比较1: response.data?.data?.status === 1,
      平台状态: response.data?.data?.platformStatus
    }

    if (response.data?.data?.status === PAYMENT_STATUS.PAID || response.data?.data?.status === 1) {
      ElMessage.success('支付状态：已支付')
    } else {
      ElMessage.info(`支付状态：${response.data?.data?.status || '未知'}`)
    }

  } catch (err) {
    console.error('查询支付状态失败:', err)
    error.value = err.message || '查询失败'
    ElMessage.error('查询支付状态失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.payment-status-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.input-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.result-section, .error-section, .status-info {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
}

.result-section {
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
}

.error-section {
  background-color: #fef2f2;
  border: 1px solid #ef4444;
}

.status-info {
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
}

.result-content {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
