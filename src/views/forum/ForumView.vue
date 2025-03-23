<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores'
import { navigate } from '@/utils/router'

const router = useRouter()
const userStore = useUserStore()
// 分类选项卡
const tabs = ref([
  { name: 'all', label: '全部帖子' },
  { name: 'hot', label: '打球组队' },
  { name: 'notice', label: '公告通知' },
  { name: 'help', label: '求助问答' },
  { name: 'exp', label: '经验交流' },
])

// 当前激活的分类标签
const activeTab = ref('all')

// 搜索关键词
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(50)

// TODO: 调用API获取帖子列表数据
const topics = ref([
  {
    id: 1,
    title: '新手请教：如何选择适合自己的羽毛球拍？',
    author: '羽球新手',
    publishTime: '2024-03-15',
    views: 256,
    replies: 18,
    lastReply: '2024-03-18',
    cate: '求助问答',
  },
  {
    id: 2,
    title: '分享一些羽毛球基本步法训练方法',
    author: '球技达人',
    publishTime: '2024-03-14',
    views: 389,
    replies: 24,
    lastReply: '2024-03-18',
    cate: '经验交流',
  },
  {
    id: 3,
    title: '南湖校区羽毛球馆环境如何？',
    author: '校园爱好者',
    publishTime: '2024-03-12',
    views: 175,
    replies: 12,
    lastReply: '2024-03-17',
    cate: '求助问答',
  },
  {
    id: 4,
    title: '羽毛球拍线的选择和保养经验分享',
    author: '资深玩家',
    publishTime: '2024-03-10',
    views: 452,
    replies: 36,
    lastReply: '2024-03-18',
    cate: '经验交流',
  },
  {
    id: 5,
    title: '求组队：每周末南湖校区打球',
    author: '找队友',
    publishTime: '2024-03-08',
    views: 321,
    replies: 29,
    lastReply: '2024-03-17',
    cate: '打球组队',
  },
  {
    id: 6,
    title: '【重要通知】羽毛球馆装修升级公告',
    author: '管理员',
    publishTime: '2024-03-18',
    views: 589,
    replies: 45,
    lastReply: '2024-03-19',
    cate: '公告通知',
  },
  {
    id: 7,
    title: '羽毛球双打配合技巧分享',
    author: '双打专家',
    publishTime: '2024-03-16',
    views: 423,
    replies: 31,
    lastReply: '2024-03-19',
    cate: '经验交流',
  },
  {
    id: 8,
    title: '寻找固定双打搭档',
    author: '单打选手',
    publishTime: '2024-03-15',
    views: 267,
    replies: 15,
    lastReply: '2024-03-18',
    cate: '打球组队',
  },
  {
    id: 9,
    title: '羽毛球拍线断了，求推荐穿线地点',
    author: '新手求助',
    publishTime: '2024-03-14',
    views: 198,
    replies: 12,
    lastReply: '2024-03-17',
    cate: '求助问答',
  },
  {
    id: 10,
    title: '【活动】周末羽毛球友谊赛报名开始',
    author: '活动组织者',
    publishTime: '2024-03-13',
    views: 678,
    replies: 89,
    lastReply: '2024-03-19',
    cate: '公告通知',
  },
  {
    id: 11,
    title: '羽毛球单打战术分析',
    author: '战术大师',
    publishTime: '2024-03-12',
    views: 534,
    replies: 42,
    lastReply: '2024-03-18',
    cate: '经验交流',
  },
  {
    id: 12,
    title: '新手求教：如何提高发球质量？',
    author: '发球新手',
    publishTime: '2024-03-11',
    views: 345,
    replies: 28,
    lastReply: '2024-03-17',
    cate: '求助问答',
  },
  {
    id: 13,
    title: '寻找周末固定球友',
    author: '周末球友',
    publishTime: '2024-03-10',
    views: 289,
    replies: 23,
    lastReply: '2024-03-16',
    cate: '打球组队',
  },
  {
    id: 14,
    title: '羽毛球馆会员卡办理指南',
    author: '管理员',
    publishTime: '2024-03-09',
    views: 456,
    replies: 34,
    lastReply: '2024-03-15',
    cate: '公告通知',
  },
  {
    id: 15,
    title: '羽毛球体能训练计划分享',
    author: '体能教练',
    publishTime: '2024-03-08',
    views: 567,
    replies: 47,
    lastReply: '2024-03-14',
    cate: '经验交流',
  },
])

// 根据分类过滤文章
const filteredTopics = computed(() => {
  // 根据搜索关键词和分类标签进行过滤
  let result = topics.value

  // 如果有搜索关键词，按关键词过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (topic) =>
        topic.title.toLowerCase().includes(keyword) || topic.author.toLowerCase().includes(keyword),
    )
  }

  // 如果不是全部分类，继续按分类过滤
  if (activeTab.value !== 'all') {
    const categoryMap = {
      hot: '打球组队',
      notice: '公告通知',
      help: '求助问答',
      exp: '经验交流',
    }
    result = result.filter((topic) => topic.cate === categoryMap[activeTab.value])
  }

  return result
})

// 分页后的文章列表
const paginatedTopics = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTopics.value.slice(start, end)
})

// 更新总页数
const updateTotal = () => {
  total.value = filteredTopics.value.length
}

// 跳转到发布页面
const navigateToPublish = () => {
  // 检查用户是否已登录
  if (!userStore.token) {
    // 未登录，跳转到登录页面
    ElMessage.warning('请先登录后再发布文章')
    navigate('/login')
    return
  }

  // 已登录，在新标签页跳转到发布页面
  router.push('/publish-post')
}

// 跳转到文章详情
const navigateToDetail = (postId) => {
  // 在新标签页打开
  navigate(`/post/${postId}`)
}

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1 // 重置页码
  // TODO: 调用后端API进行搜索
  console.log('搜索关键词：', searchKeyword.value)

  // 更新总数，搜索功能通过计算属性filteredTopics实现
  updateTotal()
}

// 分页变化
const handlePageChange = (page) => {
  currentPage.value = page
  // TODO: 调用后端API获取对应页的数据
  console.log('当前页码：', page)
}

// 分页大小变化
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

// 监听分类变化，重置分页
watch(activeTab, () => {
  currentPage.value = 1
  updateTotal()
})

// 初始化总页数
onMounted(() => {
  updateTotal()
})
</script>

<template>
  <div class="forum-container">
    <h2>羽你同行论坛</h2>

    <div class="forum-actions">
      <el-button type="primary" @click="navigateToPublish">发布新帖</el-button>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索论坛内容"
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </div>

    <div class="forum-content">
      <el-tabs v-model="activeTab" class="demo-tabs">
        <el-tab-pane
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.label"
          :name="tab.name"
        ></el-tab-pane>
      </el-tabs>

      <div class="topics-container">
        <el-table :data="paginatedTopics" style="width: 100%">
          <el-table-column prop="title" label="主题" min-width="300">
            <template #default="scope">
              <div class="topic-title" @click="navigateToDetail(scope.row.id)">
                {{ scope.row.title }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="author" label="作者" width="120">
            <template #default="scope">
              <div class="topic-author">{{ scope.row.author }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="replies" label="回复/查看" width="120">
            <template #default="scope">
              <div class="topic-stats">
                <div>{{ scope.row.replies }} 回复</div>
                <div>{{ scope.row.views }} 查看</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="lastReply" label="最后回复" width="120">
            <template #default="scope">
              <div class="topic-last-reply">{{ scope.row.lastReply }}</div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 8, 10, 15]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <div class="forum-sidebar">
      <el-card class="forum-stats-card">
        <template #header>
          <div class="card-header">
            <span>论坛统计</span>
          </div>
        </template>
        <div class="stats-item">
          <span class="stats-label">今日发帖：</span>
          <span class="stats-value">28</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">总帖子数：</span>
          <span class="stats-value">2,568</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">总会员数：</span>
          <span class="stats-value">1,256</span>
        </div>
        <div class="stats-item">
          <span class="stats-label">在线会员：</span>
          <span class="stats-value">86</span>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.forum-container {
  padding: 0;
}

h2 {
  text-align: center;
  color: #2b6fc2;
  margin-bottom: 30px;
}

.forum-actions {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-input {
  width: 300px;
}

.forum-content {
  margin-bottom: 30px;
}

.topics-container {
  margin-top: 20px;
}

.topic-title {
  color: #2b6fc2;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s;
}

.topic-title:hover {
  color: #409eff;
  text-decoration: underline;
}

.topic-author {
  color: #666;
}

.topic-stats {
  font-size: 12px;
  color: #999;
}

.topic-last-reply {
  font-size: 12px;
  color: #666;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.forum-sidebar {
  margin-top: 30px;
}

.forum-stats-card :deep(.el-card__header) {
  padding: 10px;
  background-color: #f5f5f5;
}

.stats-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.stats-item:last-child {
  border-bottom: none;
}

.stats-label {
  color: #666;
}

.stats-value {
  font-weight: bold;
  color: #2b6fc2;
}
</style>
