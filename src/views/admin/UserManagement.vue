<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getUserList, resetUserPassword, getUserDetail } from '@/api/userManage'

// 响应式数据
const loading = ref(false)
const userList = ref([])
const detailDialogVisible = ref(false)
const currentUser = ref(null)

// 搜索表单
const searchForm = reactive({
  keyword: '',
  role: '',
})

// 分页数据
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm,
    }

    const response = await getUserList(params)

    if (response.data.code === 0) {
      const data = response.data.data
      userList.value = data.list
      pagination.total = data.total
      pagination.page = data.pageNum
      pagination.size = data.pageSize
    } else {
      ElMessage.error(response.data.msg || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索用户
const handleSearch = () => {
  pagination.page = 1
  fetchUserList()
}

// 重置搜索
const handleReset = () => {
  searchForm.keyword = ''
  searchForm.role = ''
  pagination.page = 1
  fetchUserList()
}

// 查看用户详情
const handleViewDetail = async (user) => {
  try {
    const response = await getUserDetail(user.id)

    if (response.data.code === 0) {
      currentUser.value = response.data.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.data.msg || '获取用户详情失败')
    }
  } catch (error) {
    console.error('获取用户详情失败:', error)
    ElMessage.error('获取用户详情失败')
  }
}

// 重置用户密码
const handleResetPassword = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.username}" 的密码吗？重置后密码将变为 "123456"`,
      '确认重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const response = await resetUserPassword(user.id)

    if (response.data.code === 0) {
      ElMessage.success(response.data.msg || '密码重置成功')
    } else {
      ElMessage.error(response.data.msg || '密码重置失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (newSize) => {
  pagination.size = newSize
  pagination.page = 1
  fetchUserList()
}

// 当前页改变
const handleCurrentChange = (newPage) => {
  pagination.page = newPage
  fetchUserList()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <div class="user-management">
    <div class="header">
      <h2>用户管理</h2>
      <div class="search-bar">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索用户名"
          style="width: 200px; margin-right: 10px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-select
          v-model="searchForm.role"
          placeholder="选择角色"
          style="width: 150px; margin-right: 10px"
          clearable
        >
          <el-option label="普通用户" value="ROLE_USER" />
          <el-option label="管理员" value="ROLE_ADMIN" />
        </el-select>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="table-container">
      <el-table
        v-loading="loading"
        :data="userList"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ROLE_ADMIN' ? 'danger' : 'primary'">
              {{ row.role === 'ROLE_ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" width="80" />
        <el-table-column prop="location" label="地区" width="100" />
        <el-table-column prop="createTime" label="注册时间" width="160" />
        <el-table-column prop="lastLoginAt" label="最后登录" width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleResetPassword(row)"
            >
              重置密码
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="用户详情"
      width="600px"
    >
      <div v-if="currentUser" class="user-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户ID">
            {{ currentUser.id }}
          </el-descriptions-item>
          <el-descriptions-item label="用户名">
            {{ currentUser.username }}
          </el-descriptions-item>
          <el-descriptions-item label="昵称">
            {{ currentUser.nickname || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentUser.phone || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            {{ currentUser.gender || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="生日">
            {{ currentUser.birthday || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="地区">
            {{ currentUser.location || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="currentUser.role === 'ROLE_ADMIN' ? 'danger' : 'primary'">
              {{ currentUser.role === 'ROLE_ADMIN' ? '管理员' : '普通用户' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="注册时间" :span="2">
            {{ currentUser.createdAt }}
          </el-descriptions-item>
          <el-descriptions-item label="最后登录" :span="2">
            {{ currentUser.lastLoginAt || '从未登录' }}
          </el-descriptions-item>
          <el-descriptions-item label="个人简介" :span="2">
            {{ currentUser.bio || '暂无简介' }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentUser.avatar" class="avatar-section">
          <h4>头像</h4>
          <el-image
            :src="currentUser.avatar"
            style="width: 100px; height: 100px"
            fit="cover"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  align-items: center;
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.user-detail {
  padding: 20px 0;
}

.avatar-section {
  margin-top: 20px;
  text-align: center;
}

.avatar-section h4 {
  margin-bottom: 10px;
  color: #333;
}
</style>
