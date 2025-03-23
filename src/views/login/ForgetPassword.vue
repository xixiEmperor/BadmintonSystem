<script>
export default {
  name: 'ForgetPasswordView',
}
</script>
<script setup>
import { User, Lock, Message, WarningFilled } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { authForgetPasswordService, authResetPasswordService } from '@/api/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const formModel = ref({
  username: '',
  email: '',
  verifyCode: '',
  newPassword: '',
  confirmPassword: '', // 看后端接口，可能不用传
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 10, message: '请输入5-10位用户名', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 4, max: 6, message: '请输入4-6位验证码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '请输入6-15位非空密码', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formModel.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const form = ref()
const loading = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)
let timer = null

// 发送验证码
const sendVerifyCode = async () => {
  try {
    // 验证用户名和邮箱
    await form.value.validateField(['username', 'email'])

    isSendingCode.value = true
    // 调用发送验证码接口
    const res = await authForgetPasswordService({
      username: formModel.value.username,
      email: formModel.value.email,
    })

    if (res.code === 0) {
      ElMessage.success('验证码已发送至您的邮箱')
      // 启动倒计时
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          isSendingCode.value = false
        }
      }, 1000)
    } else {
      ElMessage.error(res.message || '发送验证码失败')
      isSendingCode.value = false
    }
  } catch (error) {
    console.error('发送验证码错误:', error)
    ElMessage.error(error.message || '发送验证码失败')
    isSendingCode.value = false
  }
}

// 重置密码
const resetPassword = async () => {
  try {
    await form.value.validate()
    loading.value = true

    const res = await authResetPasswordService({
      username: formModel.value.username,
      email: formModel.value.email,
      verifyCode: formModel.value.verifyCode,
      newPassword: formModel.value.newPassword,
    })

    if (res.code === 0) {
      ElMessage.success('密码重置成功')
      router.push('/login')
    } else {
      ElMessage.error(res.message || '密码重置失败')
    }
  } catch (error) {
    console.error('重置密码错误:', error)
    ElMessage.error(error.message || '密码重置失败')
  } finally {
    loading.value = false
  }
}

// 返回登录页
const goBack = () => {
  router.push('/login')
}
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form :model="formModel" :rules="rules" ref="form" size="large" autocomplete="off">
        <el-form-item>
          <h1>找回密码</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入账号"
          ></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="formModel.email"
            :prefix-icon="Message"
            type="email"
            placeholder="请输入邮箱"
          ></el-input>
        </el-form-item>
        <el-form-item prop="verifyCode">
          <div class="verify-code-container">
            <el-input
              v-model="formModel.verifyCode"
              :prefix-icon="WarningFilled"
              placeholder="请输入验证码"
            ></el-input>
            <el-button
              type="primary"
              :disabled="isSendingCode"
              @click="sendVerifyCode"
              class="verify-code-btn"
            >
              {{ isSendingCode ? `${countdown}秒后重新获取` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            v-model="formModel.newPassword"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入新密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formModel.confirmPassword"
            :prefix-icon="Lock"
            type="password"
            placeholder="请确认新密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="resetPassword"
            class="button"
            type="primary"
            auto-insert-space
            :loading="loading"
          >
            保存
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="goBack"> ← 返回登录 </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background: url('../../assets/login_images/background.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
    .verify-code-container {
      display: flex;
      gap: 10px;
      .verify-code-btn {
        flex-shrink: 0;
        min-width: 110px;
      }
    }
  }
}
</style>
