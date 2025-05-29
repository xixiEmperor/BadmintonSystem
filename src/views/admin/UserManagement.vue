<script setup>
import { ref, reactive, onMounted } from 'vue'
// 暂时注释掉API导入，使用模拟数据
// import { getUserList, resetUserPassword, getUserDetail } from '@/api/userManage'

// 模拟数据
const mockUserList = [
  {
    id: 1,
    username: 'admin',
    nickname: '系统管理员',
    email: 'admin@example.com',
    phone: '13800138001',
    role: 'ROLE_ADMIN',
    gender: '男',
    location: '北京市',
    createTime: '2023-01-15 10:30:00',
    lastLoginAt: '2024-01-20 14:25:30',
    createdAt: '2023-01-15 10:30:00',
    birthday: '1990-05-15',
    bio: '系统管理员，负责平台运维和用户管理',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 2,
    username: 'zhangsan',
    nickname: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138002',
    role: 'ROLE_USER',
    gender: '男',
    location: '上海市',
    createTime: '2023-02-20 09:15:00',
    lastLoginAt: '2024-01-19 16:45:20',
    createdAt: '2023-02-20 09:15:00',
    birthday: '1995-08-20',
    bio: '前端开发工程师，热爱技术分享',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png'
  },
  {
    id: 3,
    username: 'lisi',
    nickname: '李四',
    email: 'lisi@example.com',
    phone: '13800138003',
    role: 'ROLE_USER',
    gender: '女',
    location: '广州市',
    createTime: '2023-03-10 14:20:00',
    lastLoginAt: '2024-01-18 11:30:15',
    createdAt: '2023-03-10 14:20:00',
    birthday: '1992-12-03',
    bio: 'UI设计师，专注用户体验设计',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
  },
  {
    id: 4,
    username: 'wangwu',
    nickname: '王五',
    email: 'wangwu@example.com',
    phone: '13800138004',
    role: 'ROLE_USER',
    gender: '男',
    location: '深圳市',
    createTime: '2023-04-05 16:45:00',
    lastLoginAt: '2024-01-17 09:20:45',
    createdAt: '2023-04-05 16:45:00',
    birthday: '1988-07-12',
    bio: '后端开发工程师，擅长微服务架构',
    avatar: null
  },
  {
    id: 5,
    username: 'zhaoliu',
    nickname: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138005',
    role: 'ROLE_USER',
    gender: '女',
    location: '杭州市',
    createTime: '2023-05-12 11:30:00',
    lastLoginAt: null,
    createdAt: '2023-05-12 11:30:00',
    birthday: '1993-03-25',
    bio: '产品经理，关注用户需求和产品体验',
    avatar: 'https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg'
  },
  {
    id: 6,
    username: 'sunqi',
    nickname: '孙七',
    email: 'sunqi@example.com',
    phone: '13800138006',
    role: 'ROLE_USER',
    gender: '男',
    location: '成都市',
    createTime: '2023-06-18 13:15:00',
    lastLoginAt: '2024-01-16 15:10:30',
    createdAt: '2023-06-18 13:15:00',
    birthday: '1991-11-08',
    bio: '测试工程师，保障产品质量',
    avatar: null
  },
  {
    id: 7,
    username: 'zhouba',
    nickname: '周八',
    email: 'zhouba@example.com',
    phone: '13800138007',
    role: 'ROLE_ADMIN',
    gender: '女',
    location: '西安市',
    createTime: '2023-07-22 10:00:00',
    lastLoginAt: '2024-01-15 12:35:20',
    createdAt: '2023-07-22 10:00:00',
    birthday: '1989-09-14',
    bio: '运营管理员，负责内容审核和用户服务',
    avatar: 'https://cube.elemecdn.com/8/27/f01c15bb73e1ef3793e64e6b7bbccjpeg.jpeg'
  },
  {
    id: 8,
    username: 'wujiu',
    nickname: '吴九',
    email: 'wujiu@example.com',
    phone: '13800138008',
    role: 'ROLE_USER',
    gender: '男',
    location: '南京市',
    createTime: '2023-08-30 15:45:00',
    lastLoginAt: '2024-01-14 08:50:10',
    createdAt: '2023-08-30 15:45:00',
    birthday: '1994-04-18',
    bio: '数据分析师，专注业务数据洞察',
    avatar: null
  }
]

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

// 过滤模拟数据的函数
const filterMockData = () => {
  let filteredData = [...mockUserList]

  // 根据关键词过滤
  if (searchForm.keyword) {
    filteredData = filteredData.filter(user =>
      user.username.includes(searchForm.keyword) ||
      user.nickname.includes(searchForm.keyword) ||
      user.email.includes(searchForm.keyword)
    )
  }

  // 根据角色过滤
  if (searchForm.role) {
    filteredData = filteredData.filter(user => user.role === searchForm.role)
  }

  // 计算分页
  const total = filteredData.length
  const start = (pagination.page - 1) * pagination.size
  const end = start + pagination.size
  const pageData = filteredData.slice(start, end)

  return {
    list: pageData,
    total: total,
    pageNum: pagination.page,
    pageSize: pagination.size
  }
}

// 获取用户列表
const fetchUserList = async () => {
  try {
    loading.value = true

    // 使用模拟数据
    const mockResponse = filterMockData()
    userList.value = mockResponse.list
    pagination.total = mockResponse.total
    pagination.page = mockResponse.pageNum
    pagination.size = mockResponse.pageSize

    // 原有的API调用代码（暂时注释掉）
    /*
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
    */
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
    // 使用模拟数据
    const mockUser = mockUserList.find(u => u.id === user.id)
    if (mockUser) {
      currentUser.value = mockUser
      detailDialogVisible.value = true
    }

    // 原有的API调用代码（暂时注释掉）
    /*
    const response = await getUserDetail(user.id)

    if (response.data.code === 0) {
      currentUser.value = response.data.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.data.msg || '获取用户详情失败')
    }
    */
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

    // 模拟重置密码成功
    ElMessage.success('密码重置成功')

    // 原有的API调用代码（暂时注释掉）
    /*
    const response = await resetUserPassword(user.id)

    if (response.data.code === 0) {
      ElMessage.success(response.data.msg || '密码重置成功')
    } else {
      ElMessage.error(response.data.msg || '密码重置失败')
    }
    */
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
