<template>
  <div class="qr-test">
    <h3>二维码测试</h3>
    <div class="input-section">
      <el-input
        v-model="inputText"
        placeholder="请输入要生成二维码的文本"
        style="width: 300px; margin-right: 10px;"
      />
      <el-button type="primary" @click="generateQR">生成二维码</el-button>
    </div>

    <div v-if="qrCodeUrl" class="qr-display">
      <h4>生成的二维码：</h4>
      <img :src="qrCodeUrl" alt="二维码" style="width: 200px; height: 200px; border: 1px solid #ddd;" />
    </div>

    <div v-if="error" class="error">
      <p style="color: red;">错误：{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QRCode from 'qrcode'

const inputText = ref('https://www.example.com')
const qrCodeUrl = ref('')
const error = ref('')

const generateQR = async () => {
  try {
    error.value = ''
    const qrDataURL = await QRCode.toDataURL(inputText.value, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    qrCodeUrl.value = qrDataURL
  } catch (err) {
    error.value = err.message
    console.error('生成二维码失败:', err)
  }
}

// 组件加载时生成默认二维码
generateQR()
</script>

<style scoped>
.qr-test {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.input-section {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.qr-display {
  text-align: center;
  margin-top: 20px;
}

.error {
  margin-top: 20px;
}
</style>
