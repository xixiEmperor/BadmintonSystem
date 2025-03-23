<script>
export default {
  name: 'LoginView',
}
</script>
<script setup>
import { User, Lock, Message } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { authRegisterService, authLoginService } from '@/api/auth'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'

const userStore = useUserStore()
const router = useRouter()
const isRegister = ref(false) // 默认显示登录页面
const formModel = ref({
  username: '',
  password: '',
  email: '', // 新增邮箱字段
})
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 10, message: '请输入5-10位用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '请输入6-15位非空密码', trigger: 'blur' },
  ],
  repassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== formModel.value.password) {
          callback(new Error('请输入相同的密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
  ],
}
const form = ref()

//对当前表单进行侦听，如果有isRegister的切换就重置表单
watch(isRegister, () => {
  formModel.value = {
    username: '',
    password: '',
    repassword: '',
    email: '', // 重置邮箱字段
  }
})

// 注册
const register = async () => {
  await form.value.validate()
  // 模拟注册服务，实际项目中应调用后端API
  // 在实际项目中，这里应该调用API将用户信息发送到服务器
  const res = await authRegisterService(formModel.value)
  if (res.code === 0) {
    ElMessage.success('注册成功')
    isRegister.value = false
  } else {
    ElMessage.error('注册失败')
  }
  isRegister.value = false
}

// 登录
const login = async () => {
  await form.value.validate()

  try {
    // 调用登录服务
    const res = await authLoginService(formModel.value)
    console.log('登录响应:', res)

    if (res.data.token) {
      ElMessage.success('登录成功')
      userStore.setToken(res.data.token)

      // 先获取用户信息，注意添加await
      await userStore.getUserinfo()
      console.log('获取到的用户信息:', userStore.userinfo)

      // 获取到用户信息后再判断角色和跳转
      if (userStore.userinfo?.role === 'ROLE_ADMIN') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      ElMessage.error('登录失败：未获取到token')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error(`登录失败: ${error.response?.data?.message || error.message || '未知错误'}`)
  }
}

// 修改忘记密码的跳转路径
const goToForgetPassword = () => {
  router.push('/login/forget-password')
}
</script>

<template>
  <!-- 添加router-view用于显示子路由 -->
  <router-view v-if="$route.path !== '/login'"></router-view>

  <el-row class="login-page" v-if="$route.path === '/login'">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <el-form
        :model="formModel"
        :rules="rules"
        ref="form"
        size="large"
        autocomplete="off"
        v-if="isRegister"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            v-model="formModel.repassword"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入再次密码"
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
        <el-form-item>
          <el-button @click="register" class="button" type="primary" auto-insert-space>
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = false"> ← 返回 </el-link>
        </el-form-item>
      </el-form>
      <el-form :model="formModel" :rules="rules" ref="form" size="large" autocomplete="off" v-else>
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false" @click="goToForgetPassword"
              >忘记密码？</el-link
            >
          </div>
        </el-form-item>
        <el-form-item>
          <el-button @click="login" class="button" type="primary" auto-insert-space>登录</el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = true"> 注册 → </el-link>
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
  }
}
</style>
