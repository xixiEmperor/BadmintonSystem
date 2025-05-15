<script setup>
import { ref, reactive, onMounted } from 'vue'
import { User, Location, Iphone, Calendar } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores'
import { updateUserProfile, uploadAvatar } from '@/api/user'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
// 保存来源路由，用于返回
const fromRoute = ref('/')

const userStore = useUserStore()
// 用户信息表单
const userInfo = reactive({
  username: '',
  nickname: '',
  phone: '',
  bio: '',
  gender: '',
  birthday: '',
  location: '',
  avatar: '',
})

// 表单引用
const userFormRef = ref(null)

// 加载中状态
const loading = ref(false)

// 性别选项
const genderOptions = [
  {
    value: 'male',
    label: '男',
  },
  {
    value: 'female',
    label: '女',
  },
  {
    value: 'other',
    label: '其他',
  },
]

// 头像上传相关
const avatarUrl = ref('')

// 表单验证规则
const rules = {
  nickname: [
    {
      pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/,
      message: '名称只能由英文字母，汉字组成',
      trigger: 'blur',
    },
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }],
}

// 头像上传前的钩子
const beforeAvatarUpload = (file) => {
  const isValidFormat = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidFormat) {
    ElMessage.error('文件格式不支持，请上传jpg、png或jpeg格式图片')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('头像大小不能超过 10MB!')
    return false
  }
  return true
}

// 处理图片压缩
const compressImage = (file, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        // 创建canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // 设置大小，最大宽高为800px
        let width = img.width
        let height = img.height
        const maxSize = 800

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // 转为Blob
        canvas.toBlob((blob) => {
          // 创建新的File对象
          const newFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(newFile)
        }, file.type, quality)
      }
    }
  })
}

// 头像上传成功的钩子
const handleAvatarSuccess = async (response, uploadFile) => {
  if (uploadFile.raw) {
    try {
      // 压缩图片
      const compressedFile = await compressImage(uploadFile.raw)

      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', compressedFile)

      // 临时显示本地预览
      const reader = new FileReader()
      reader.readAsDataURL(compressedFile)
      reader.onload = () => {
        avatarUrl.value = reader.result
      }

      // 调用API上传头像
      const res = await uploadAvatar(formData)

      if (res.data.code === 0) {
        // 更新头像URL为服务器返回的URL
        avatarUrl.value = res.data.data.avatarUrl
        userInfo.avatar = res.data.data.avatarUrl

        // 更新用户信息
        const storedUserInfo = userStore.userinfo
        const updatedUserInfo = {
          ...storedUserInfo,
          avatar: res.data.data.avatarUrl
        }

        // 更新store中的用户信息
        userStore.setUserinfo(updatedUserInfo)

        // 方法1：使用自定义事件通知导航栏更新头像
        window.dispatchEvent(new CustomEvent('user-avatar-updated', {
          detail: { avatarUrl: res.data.data.avatarUrl }
        }))

        // 方法2：如果上面的自定义事件不起作用，可以尝试强制刷新页面组件
        // location.reload()

        ElMessage.success(res.data.message || '上传成功')
      } else {
        ElMessage.error(res.data.message || '上传失败')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      ElMessage.error(error.response?.data?.message || '头像上传失败')
    }
  }
}

// 处理头像变更
const handleAvatarChange = (uploadFile) => {
  if (uploadFile.raw && beforeAvatarUpload(uploadFile.raw)) {
    handleAvatarSuccess(null, uploadFile)
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  try {
    loading.value = true
    await userFormRef.value.validate()

    // TODO: 调用API将用户信息更新到后端
    const res = await updateUserProfile(userInfo)
    ElMessage.success(res.data.msg)
    // 从userStore获取当前存储的用户信息
    const storedUserInfo = userStore.userinfo

    // 合并新旧信息
    const updatedUserInfo = {
      ...storedUserInfo,
      ...res.data.data
    }

    // 保存到userStore
    userStore.setUserinfo(updatedUserInfo)

    // 返回到来源页面
    router.push(fromRoute.value)
  } catch (error) {
    ElMessage.error(error.response.data.message)
  } finally {
    loading.value = false
  }
}

// 初始化用户信息
const initUserInfo = () => {
  // 从userStore获取当前存储的用户信息
  const storedUserInfo = userStore.userinfo
  if (storedUserInfo) {
    try {
      // 填充表单
      Object.keys(userInfo).forEach((key) => {
        if (storedUserInfo[key]) {
          userInfo[key] = storedUserInfo[key]
        }
      })

      // 设置头像URL
      if (storedUserInfo.avatar) {
        avatarUrl.value = storedUserInfo.avatar
      }
    } catch (e) {
      ElMessage.error(e.response.data.message)
    }
  }

  // 获取来源路由
  if (route.query.from) {
    fromRoute.value = route.query.from
  } else if (document.referrer && document.referrer.includes(window.location.origin)) {
    // 如果有referrer且来自同一域名，提取路径部分
    const url = new URL(document.referrer)
    fromRoute.value = url.pathname + url.search
  }
}

// 组件挂载时加载用户信息
onMounted(() => {
  initUserInfo()
})
</script>

<template>
  <div class="user-center-container">
    <h2>个人中心</h2>

    <el-card class="user-center-card">
      <el-form
        ref="userFormRef"
        :model="userInfo"
        :rules="rules"
        label-position="top"
        class="user-form"
      >
        <!-- 头像上传 -->
        <el-form-item label="头像" class="avatar-uploader-container">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload"
            :auto-upload="false"
            name="file"
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
            <img v-else src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" class="avatar" alt="默认头像" />
            <div class="avatar-hover-text">点击更换头像</div>
          </el-upload>
        </el-form-item>

        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>

          <el-form-item label="账号">
            <el-input v-model="userInfo.username" disabled placeholder="userinfo.username"></el-input>
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="userInfo.nickname"
              placeholder="请输入昵称"
              :prefix-icon="User"
            ></el-input>
          </el-form-item>

          <el-form-item label="手机号码" prop="phone">
            <el-input
              v-model="userInfo.phone"
              placeholder="请输入手机号码"
              :prefix-icon="Iphone"
            ></el-input>
          </el-form-item>

          <el-form-item label="个人简介">
            <el-input
              v-model="userInfo.bio"
              type="textarea"
              placeholder="请输入个人简介"
              :rows="4"
            ></el-input>
          </el-form-item>
        </div>

        <!-- 更多信息 -->
        <div class="form-section">
          <h3>更多信息</h3>

          <el-form-item label="性别">
            <el-select v-model="userInfo.gender" placeholder="请选择性别" style="width: 100%">
              <el-option
                v-for="item in genderOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="生日">
            <el-date-picker
              v-model="userInfo.birthday"
              type="date"
              placeholder="请选择生日"
              style="width: 100%"
              :prefix-icon="Calendar"
            ></el-date-picker>
          </el-form-item>

          <el-form-item label="所在地">
            <el-input
              v-model="userInfo.location"
              placeholder="请输入所在地"
              :prefix-icon="Location"
            ></el-input>
          </el-form-item>
        </div>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="saveUserInfo" :loading="loading" class="save-btn"
            >保存修改</el-button
          >
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="less" scoped>
.user-center-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;

  h2 {
    text-align: center;
    color: #2b6fc2;
    margin-bottom: 30px;
  }

  .user-center-card {
    margin-bottom: 30px;
  }

  .user-form {
    .form-section {
      margin-bottom: 30px;

      h3 {
        font-size: 18px;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
        color: #2b6fc2;
      }
    }
  }

  .avatar-uploader-container {
    display: flex;
    justify-content: center;
    margin-bottom: 30px;

    :deep(.el-form-item__content) {
      display: flex;
      justify-content: center;
    }
  }

  .avatar-uploader {
    text-align: center;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    width: 150px;
    height: 150px;

    &:hover {
      border-color: #409eff;

      .avatar-hover-text {
        display: flex;
      }
    }
  }

  .avatar {
    width: 150px;
    height: 150px;
    display: block;
    object-fit: cover;
  }

  .avatar-hover-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: none;
    justify-content: center;
    align-items: center;
    font-size: 14px;
  }

  .save-btn {
    width: 100%;
    margin-top: 20px;
  }
}

@media screen and (max-width: 768px) {
  .user-center-container {
    padding: 10px;
  }
}
</style>
