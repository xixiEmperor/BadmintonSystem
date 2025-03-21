<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Location, Iphone, Calendar, Avatar } from '@element-plus/icons-vue'

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
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG 或 PNG 格式!')
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
  }
  return isJPG && isLt2M
}

// 头像上传成功的钩子
const handleAvatarSuccess = (response, uploadFile) => {
  // 实际项目中，这里应该获取返回的图片URL
  if (uploadFile.raw) {
    avatarUrl.value = URL.createObjectURL(uploadFile.raw)
    userInfo.avatar = avatarUrl.value
  }
}

// 保存用户信息
const saveUserInfo = async () => {
  try {
    loading.value = true
    await userFormRef.value.validate()

    // 获取当前存储的用户信息
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

    // 合并新旧信息
    const updatedUserInfo = {
      ...storedUserInfo,
      ...userInfo,
    }

    // 保存到本地存储
    localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))

    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败', error)
    ElMessage.error('请检查表单填写是否正确')
  } finally {
    loading.value = false
  }
}

// 初始化用户信息
const initUserInfo = () => {
  const storedUserInfo = localStorage.getItem('userInfo')
  if (storedUserInfo) {
    try {
      const parsedInfo = JSON.parse(storedUserInfo)
      // 填充表单
      Object.keys(userInfo).forEach((key) => {
        if (parsedInfo[key]) {
          userInfo[key] = parsedInfo[key]
        }
      })

      // 设置头像URL
      if (parsedInfo.avatar) {
        avatarUrl.value = parsedInfo.avatar
      }
    } catch (e) {
      console.error('解析用户信息失败', e)
    }
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
            action="#"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            :auto-upload="false"
            :http-request="
              (options) => {
                if (options.file) {
                  handleAvatarSuccess(null, { raw: options.file })
                }
              }
            "
          >
            <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
            <div v-else class="avatar-placeholder">
              <el-icon><Avatar /></el-icon>
              <span>点击上传头像</span>
            </div>
          </el-upload>
        </el-form-item>

        <!-- 基本信息 -->
        <div class="form-section">
          <h3>基本信息</h3>

          <el-form-item label="账号">
            <el-input v-model="userInfo.username" disabled placeholder="账号不可修改"></el-input>
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
    }
  }

  .avatar-placeholder {
    width: 150px;
    height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #8c939d;

    .el-icon {
      font-size: 40px;
      margin-bottom: 10px;
    }
  }

  .avatar {
    width: 150px;
    height: 150px;
    display: block;
    object-fit: cover;
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
