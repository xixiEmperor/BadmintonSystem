# 用户管理 API 使用示例

## 概述
本文档展示如何在前端项目中使用用户管理相关的API接口。

## API 文件位置
```
src/api/userManage.js
```

## 使用示例

### 1. 导入API函数

```javascript
import { 
  getUserList, 
  resetUserPassword, 
  getUserDetail,
  searchUsers,
  getUsersByRole,
  searchUsersAdvanced
} from '@/api/userManage'
```

### 2. 分页查询用户列表

```javascript
// 基本查询
const fetchUsers = async () => {
  try {
    const response = await getUserList({
      page: 1,
      size: 10
    })
    
    if (response.data.code === 0) {
      const data = response.data.data
      console.log('用户列表:', data.list)
      console.log('总数:', data.total)
      console.log('当前页:', data.pageNum)
      console.log('每页大小:', data.pageSize)
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
}

// 带搜索条件的查询
const fetchUsersWithSearch = async () => {
  try {
    const response = await getUserList({
      keyword: 'test',        // 搜索关键词
      role: 'ROLE_USER',      // 角色过滤
      page: 1,
      size: 20
    })
    
    if (response.data.code === 0) {
      console.log('搜索结果:', response.data.data.list)
    }
  } catch (error) {
    console.error('搜索用户失败:', error)
  }
}
```

### 3. 搜索用户

```javascript
// 按用户名搜索
const searchUsersByKeyword = async (keyword) => {
  try {
    const response = await searchUsers({
      keyword: keyword,
      page: 1,
      size: 10
    })
    
    if (response.data.code === 0) {
      console.log('搜索结果:', response.data.data.list)
    }
  } catch (error) {
    console.error('搜索失败:', error)
  }
}

// 按角色查询
const fetchAdminUsers = async () => {
  try {
    const response = await getUsersByRole({
      role: 'ROLE_ADMIN',
      page: 1,
      size: 10
    })
    
    if (response.data.code === 0) {
      console.log('管理员用户:', response.data.data.list)
    }
  } catch (error) {
    console.error('查询管理员失败:', error)
  }
}

// 高级搜索（组合条件）
const advancedSearch = async () => {
  try {
    const response = await searchUsersAdvanced({
      keyword: 'admin',
      role: 'ROLE_ADMIN',
      page: 1,
      size: 10
    })
    
    if (response.data.code === 0) {
      console.log('高级搜索结果:', response.data.data.list)
    }
  } catch (error) {
    console.error('高级搜索失败:', error)
  }
}
```

### 4. 获取用户详情

```javascript
const fetchUserDetail = async (userId) => {
  try {
    const response = await getUserDetail(userId)
    
    if (response.data.code === 0) {
      const user = response.data.data
      console.log('用户详情:', {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
        role: user.role,
        gender: user.gender,
        birthday: user.birthday,
        location: user.location,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      })
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
  }
}
```

### 5. 重置用户密码

```javascript
const resetPassword = async (userId) => {
  try {
    // 通常需要确认对话框
    const confirmed = await ElMessageBox.confirm(
      '确定要重置该用户的密码吗？重置后密码将变为 "123456"',
      '确认重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    if (confirmed) {
      const response = await resetUserPassword(userId)
      
      if (response.data.code === 0) {
        ElMessage.success('密码重置成功')
        console.log('重置结果:', response.data.msg)
      } else {
        ElMessage.error(response.data.msg || '密码重置失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败')
    }
  }
}
```

## Vue 组件中的完整使用示例

```vue
<template>
  <div class="user-management">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索用户名"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="selectedRole" placeholder="选择角色">
        <el-option label="全部" value="" />
        <el-option label="普通用户" value="ROLE_USER" />
        <el-option label="管理员" value="ROLE_ADMIN" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" v-loading="loading">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="viewDetail(row.id)">详情</el-button>
          <el-button @click="resetPassword(row.id)">重置密码</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, resetUserPassword, getUserDetail } from '@/api/userManage'

// 响应式数据
const loading = ref(false)
const userList = ref([])
const searchKeyword = ref('')
const selectedRole = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await getUserList({
      keyword: searchKeyword.value,
      role: selectedRole.value,
      page: currentPage.value,
      size: pageSize.value
    })
    
    if (response.data.code === 0) {
      const data = response.data.data
      userList.value = data.list
      total.value = data.total
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchUsers()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchUsers()
}

// 查看详情
const viewDetail = async (userId) => {
  try {
    const response = await getUserDetail(userId)
    if (response.data.code === 0) {
      // 显示用户详情
      console.log('用户详情:', response.data.data)
    }
  } catch (error) {
    ElMessage.error('获取用户详情失败')
  }
}

// 重置密码
const resetPassword = async (userId) => {
  try {
    await ElMessageBox.confirm('确定要重置该用户的密码吗？')
    const response = await resetUserPassword(userId)
    
    if (response.data.code === 0) {
      ElMessage.success('密码重置成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置密码失败')
    }
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUsers()
})
</script>
```

## 错误处理

```javascript
// 统一错误处理示例
const handleApiCall = async (apiFunction, ...args) => {
  try {
    const response = await apiFunction(...args)
    
    if (response.data.code === 0) {
      return response.data.data
    } else {
      // 根据错误码处理不同错误
      switch (response.data.code) {
        case 30001:
          ElMessage.error('用户不存在')
          break
        case 30002:
          ElMessage.error('密码重置失败')
          break
        case 30003:
          ElMessage.error('权限不足，仅管理员可操作')
          break
        default:
          ElMessage.error(response.data.msg || '操作失败')
      }
      throw new Error(response.data.msg)
    }
  } catch (error) {
    console.error('API调用失败:', error)
    if (!error.message) {
      ElMessage.error('网络错误，请稍后重试')
    }
    throw error
  }
}

// 使用示例
const safeGetUserList = async (params) => {
  return await handleApiCall(getUserList, params)
}
```

## 注意事项

1. **权限验证**: 所有用户管理API都需要管理员权限，确保在调用前验证用户权限
2. **错误处理**: 建议统一处理API错误，提供友好的用户提示
3. **分页处理**: 注意分页参数的正确传递和响应数据的正确解析
4. **搜索防抖**: 在实际使用中，建议对搜索功能添加防抖处理
5. **加载状态**: 在API调用期间显示加载状态，提升用户体验

## 相关文件

- API接口文档: `docs/api/用户管理接口文档.md`
- API实现文件: `src/api/userManage.js`
- 示例页面: `src/views/admin/UserManagement.vue` 