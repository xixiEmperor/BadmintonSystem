<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { View, Delete, Edit } from '@element-plus/icons-vue'
import { formatDateTime } from '@/utils/format'
import { navigate } from '@/utils/router'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = ref({})
userInfo.value = userStore.userinfo || {}

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(25) // 模拟总数据量

// 模拟数据
const mockPosts = [
  {
    id: 1,
    title: '有人今天晚上一起打球吗？',
    author: '羽球爱好者',
    category: 'team',
    publishTime: '2023-11-15 18:30',
    replies: 12,
    views: 156,
    content: '今天晚上7点有空，想找人一起打球，有意者请联系我。'
  },
  {
    id: 2,
    title: '分享我的训练心得',
    author: '技术流',
    category: 'exp',
    publishTime: '2023-11-10 14:20',
    replies: 8,
    views: 98,
    content: '今天分享一下我的训练方法，希望对大家有帮助。'
  },
  {
    id: 3,
    title: '关于场地预订的问题',
    author: '新手上路',
    category: 'help',
    publishTime: '2023-11-05 09:15',
    replies: 5,
    views: 67,
    content: '请问场地预订后多久内可以取消？'
  },
  {
    id: 4,
    title: '羽毛球拍推荐',
    author: '装备控',
    category: 'exp',
    publishTime: '2023-10-28 16:45',
    replies: 15,
    views: 210,
    content: '给大家推荐几款性价比高的羽毛球拍。'
  },
  {
    id: 5,
    title: '周末比赛通知',
    author: '活动组织者',
    category: 'notice',
    publishTime: '2023-10-20 10:30',
    replies: 20,
    views: 300,
    content: '本周末将举办校内友谊赛，欢迎报名参加。'
  },
  {
    id: 6,
    title: '求教如何提高杀球力量',
    author: '进阶球友',
    category: 'help',
    publishTime: '2023-10-15 20:10',
    replies: 9,
    views: 125,
    content: '最近杀球总是缺乏力量，请教如何提高？'
  },
  {
    id: 7,
    title: '寻找固定球友',
    author: '固定搭子',
    category: 'team',
    publishTime: '2023-10-10 19:00',
    replies: 7,
    views: 87,
    content: '想找个水平相当的球友，每周固定打球。'
  },
  {
    id: 8,
    title: '分享一些步伐训练方法',
    author: '灵活脚步',
    category: 'exp',
    publishTime: '2023-10-05 15:30',
    replies: 11,
    views: 165,
    content: '今天分享几个提升步伐的训练方法。'
  }
]

// 用户的发帖列表
const userPosts = ref([])
const loading = ref(false)

// 加载用户发帖列表（使用模拟数据）
const loadUserPosts = () => {
  loading.value = true

  // 模拟异步请求延迟
  setTimeout(() => {
    // 根据当前页码和页面大小计算起始索引
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value

    // 获取当前页的数据
    userPosts.value = mockPosts.slice(startIndex, endIndex)

    loading.value = false
  }, 500)
}

// 跳转到帖子详情
const navigateToDetail = (postId) => {
  navigate(`/post/${postId}`)
}

// 编辑帖子
const editPost = (postId) => {
  router.push(`/edit-post/${postId}`)
}

// 删除帖子
const deletePost = (post) => {
  ElMessageBox.confirm(`确定要删除帖子"${post.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      // 模拟删除成功
      ElMessage.success('帖子删除成功')

      // 从模拟数据中移除该帖子
      const index = mockPosts.findIndex(item => item.id === post.id)
      if (index !== -1) {
        mockPosts.splice(index, 1)
        // 重新加载帖子列表
        loadUserPosts()
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  loadUserPosts()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadUserPosts()
}

// 发布新帖
const navigateToPublish = () => {
  router.push('/publish-post')
}

onMounted(() => {
  loadUserPosts()
})
</script>

<template>
  <div class="my-posts-container">
    <h2>我的发帖</h2>

    <div class="posts-header">
      <div class="user-info" v-if="userStore.token">
        <el-avatar :src="userStore.userinfo?.avatar || 'https://tse1-mm.cn.bing.net/th/id/OIP-C.gaAkkFf8LStn-oc4l8iM0wAAAA?w=160&h=180&c=7&r=0&o=5&dpr=1.5&pid=1.7'"></el-avatar>
        <span class="username">{{ userStore.userinfo?.username || '羽球爱好者' }}</span>
        <div class="user-stats">
          <div class="stat-item">发帖数量：<span>{{ total }}</span></div>
        </div>
      </div>
      <el-button type="primary" @click="navigateToPublish">发布新帖</el-button>
    </div>

    <div class="posts-content">
      <el-table
        :data="userPosts"
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无发帖记录">
        <el-table-column prop="title" label="帖子标题" min-width="300">
          <template #default="scope">
            <div class="post-title" @click="navigateToDetail(scope.row.id)">
              {{ scope.row.title }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.category === 'team' ? 'success' :
                    scope.row.category === 'notice' ? 'primary' :
                    scope.row.category === 'help' ? 'warning' :
                    scope.row.category === 'exp' ? 'info' : 'default'">
              {{ scope.row.category === 'team' ? '打球组队' :
                 scope.row.category === 'notice' ? '公告通知' :
                 scope.row.category === 'help' ? '求助问答' :
                 scope.row.category === 'exp' ? '经验交流' : '其他' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" width="180">
        </el-table-column>
        <el-table-column prop="replies" label="回复/查看" width="120">
          <template #default="scope">
            <div class="post-stats">
              <div>{{ scope.row.replies }} 回复</div>
              <div>{{ scope.row.views }} 查看</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <div class="post-actions">
              <el-button
                type="primary"
                :icon="View"
                circle
                size="small"
                @click="navigateToDetail(scope.row.id)"
                title="查看详情">
              </el-button>
              <el-button
                type="danger"
                :icon="Delete"
                circle
                size="small"
                @click="deletePost(scope.row)"
                title="删除帖子">
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-posts-container {
  padding: 0 20px;
}

h2 {
  text-align: center;
  color: #2b6fc2;
  margin-bottom: 30px;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
}

.username {
  margin-left: 10px;
  font-size: 18px;
  font-weight: bold;
}

.user-stats {
  margin-left: 20px;
  display: flex;
}

.stat-item {
  margin-right: 15px;
  color: #666;
}

.stat-item span {
  color: #2b6fc2;
  font-weight: bold;
}

.posts-content {
  margin-bottom: 30px;
}

.post-title {
  color: #2b6fc2;
  font-weight: bold;
  cursor: pointer;
}

.post-title:hover {
  text-decoration: underline;
}

.post-stats {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #666;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
