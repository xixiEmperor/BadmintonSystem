<script setup>
import { ref, onMounted } from 'vue'
import { getForumList, deletePostService, setPostTopStatus } from '@/api/forum'
import { useRouter } from 'vue-router'

const router = useRouter()

// 定义分类选项卡
const tabs = ref([
  { name: 'all', label: '全部帖子' },
  { name: 'team', label: '打球组队' },
  { name: 'notice', label: '赛事讨论' },
  { name: 'help', label: '求助问答' },
  { name: 'exp', label: '经验交流' },
])
const activeTab = ref('all')

// 帖子列表数据
const forumList = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const searchKeyword = ref('')

// 处理选项卡切换
const handleTabClick = () => {
  currentPage.value = 1
  fetchForumList()
}

// 获取帖子列表
const fetchForumList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchKeyword.value,
      category: activeTab.value !== 'all' ? activeTab.value : undefined
    }

    const res = await getForumList(params)
    forumList.value = res.data.data.list || []
    total.value = res.data.data.total || 0
    loading.value = false
  } catch (error) {
    console.error('获取帖子列表失败:', error)
    ElMessage.error('获取帖子列表失败')
    loading.value = false
  }
}

// 删除帖子
const handleDeletePost = (row) => {
  ElMessageBox.confirm(
    `确定要删除标题为「${row.title}」的帖子吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deletePostService(row.id)
        ElMessage.success('删除成功')
        fetchForumList()
      } catch (error) {
        console.error('删除帖子失败:', error)
        ElMessage.error('删除帖子失败')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchForumList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchForumList()
}

// 设置帖子置顶状态
const handleToggleTopStatus = async (row) => {
  try {
    console.log(row)
    const newTopStatus = !row.isTop
    await setPostTopStatus(row.id, newTopStatus)
    ElMessage.success(newTopStatus ? '帖子已设为置顶' : '帖子已取消置顶')
    // 更新列表数据
    fetchForumList()
  } catch (error) {
    console.error('设置置顶状态失败:', error)
    ElMessage.error('设置置顶状态失败')
  }
}

// 查看帖子详情
const viewPostDetail = (row) => {
  router.push(`/admin/forum/post/${row.id}`)
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 页面加载时获取数据
onMounted(() => {
  fetchForumList()
})
</script>


<template>
  <div class="forum-management">
    <h2>论坛管理</h2>

    <el-card class="forum-card">
      <template #header>
        <div class="card-header">
          <span>帖子列表</span>
          <div class="search-box">
            <el-input v-model="searchKeyword" placeholder="搜索帖子内容" clearable @clear="fetchForumList">
              <template #append>
                <el-button @click="fetchForumList">搜索</el-button>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <!-- 添加分类选项卡 -->
      <div class="category-tabs">
        <el-tabs v-model="activeTab" @tab-click="handleTabClick">
          <el-tab-pane v-for="tab in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
          </el-tab-pane>
        </el-tabs>
      </div>

      <el-table :data="forumList" style="width: 100%" v-loading="loading">
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip>
          <template #default="scope">
            <div class="title-cell">
              <el-tag v-if="scope.row.isTop" type="danger" effect="dark" size="small" class="top-tag">置顶</el-tag>
              <el-link type="primary" @click="viewPostDetail(scope.row)" :underline="false">
                {{ scope.row.title }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="文章类别" min-width="120" />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="publishTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.publishTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                :type="scope.row.isTop ? 'warning' : 'success'"
                size="small"
                @click="handleToggleTopStatus(scope.row)">
                {{ scope.row.isTop ? '取消置顶' : '置顶' }}
              </el-button>
              <el-button type="danger" size="small" @click="handleDeletePost(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="pageSize"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="less" scoped>
.forum-management {
  h2 {
    margin-bottom: 20px;
  }

  .forum-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-box {
        width: 300px;
      }
    }

    .category-tabs {
      margin-bottom: 20px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }

  .title-cell {
    display: flex;
    align-items: center;

    .top-tag {
      margin-right: 8px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }
}
</style>
