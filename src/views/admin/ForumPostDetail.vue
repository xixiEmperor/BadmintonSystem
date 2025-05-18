<template>
  <div class="post-detail">
    <div class="header-actions">
      <el-button type="primary" @click="goBack">返回</el-button>
      <el-button
        v-if="postData"
        :type="postData.isTop ? 'warning' : 'success'"
        @click="handleToggleTopStatus">
        {{ postData.isTop ? '取消置顶' : '设为置顶' }}
      </el-button>
    </div>

    <el-card v-loading="loading">
      <div v-if="postData">
        <div class="post-header">
          <h2 class="post-title">
            <el-tag v-if="postData.isTop" type="danger" effect="dark" size="small" class="top-tag">置顶</el-tag>
            {{ postData.title }}
          </h2>
          <div class="post-meta">
            <span>作者: {{ postData.author }}</span>
            <span>发布时间: {{ formatDateTime(postData.publishTime) }}</span>
            <span>类别: {{ postData.category }}</span>
          </div>
        </div>

        <div class="post-content">
          <p v-html="postData.content"></p>
        </div>

        <div class="post-stats">
          <span>点赞数: {{ postData.likeCount }}</span>
          <span>回复数: {{ postData.replyCount }}</span>
        </div>
      </div>

      <div v-else-if="!loading" class="not-found">
        <p>帖子不存在或已被删除</p>
      </div>
    </el-card>

    <!-- 回复列表 -->
    <el-card class="comments-card" v-if="postData && comments.length > 0">
      <template #header>
        <div class="comments-header">
          <span>回复列表 ({{ comments.length }})</span>
        </div>
      </template>

      <div class="comments-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="author">{{ comment.author }}</span>
            <span class="time">{{ formatDateTime(comment.createTime) }}</span>
          </div>
          <div class="comment-content">
            <p v-html="comment.content"></p>
          </div>
          <div class="comment-actions">
            <el-button type="danger" size="small" @click="handleDeleteComment(comment)">
              删除评论
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card v-else-if="postData" class="comments-card">
      <div class="no-comments">
        暂无回复
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getForumDetail, getForumCommentsService, deleteCommentService, setPostTopStatus } from '@/api/forum'

const route = useRoute()
const router = useRouter()
const postId = route.params.id

const loading = ref(true)
const postData = ref(null)
const comments = ref([])

// 获取帖子详情
const fetchPostDetail = async () => {
  loading.value = true
  try {
    const res = await getForumDetail(postId)
    postData.value = res.data.data
    loading.value = false

    // 获取回复列表
    if (postData.value) {
      fetchComments()
    }
  } catch (error) {
    console.error('获取帖子详情失败:', error)
    ElMessage.error('获取帖子详情失败')
    loading.value = false
  }
}

// 设置帖子置顶状态
const handleToggleTopStatus = async () => {
  try {
    const newTopStatus = !postData.value.isTop
    await setPostTopStatus(postId, newTopStatus)
    ElMessage.success(newTopStatus ? '帖子已设为置顶' : '帖子已取消置顶')
    // 更新当前页面数据
    postData.value.isTop = newTopStatus
  } catch (error) {
    console.error('设置置顶状态失败:', error)
    ElMessage.error('设置置顶状态失败')
  }
}

// 获取回复列表
const fetchComments = async () => {
  try {
    const res = await getForumCommentsService(postId, 'time')
    comments.value = res.data.data || []
  } catch (error) {
    console.error('获取回复列表失败:', error)
    ElMessage.error('获取回复列表失败')
  }
}

// 删除评论
const handleDeleteComment = (comment) => {
  ElMessageBox.confirm(
    '确定要删除这条评论吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        await deleteCommentService(postId, comment.id)
        ElMessage.success('评论删除成功')
        fetchComments() // 重新获取评论列表
      } catch (error) {
        console.error('删除评论失败:', error)
        ElMessage.error('删除评论失败')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 返回上一页
const goBack = () => {
  router.go(-1)
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

onMounted(() => {
  fetchPostDetail()
})
</script>

<style lang="less" scoped>
.post-detail {
  .header-actions {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }

  .post-header {
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 15px;
    margin-bottom: 20px;

    .post-title {
      font-size: 20px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;

      .top-tag {
        margin-right: 10px;
      }
    }

    .post-meta {
      font-size: 14px;
      color: #606266;

      span {
        margin-right: 15px;
      }
    }
  }

  .post-content {
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .post-stats {
    font-size: 14px;
    color: #606266;
    display: flex;
    margin-top: 20px;

    span {
      margin-right: 15px;
    }
  }

  .not-found {
    text-align: center;
    padding: 30px;
    font-size: 16px;
    color: #909399;
  }

  .comments-card {
    margin-top: 20px;

    .comments-header {
      font-weight: bold;
    }

    .comment-item {
      padding: 15px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .comment-header {
        margin-bottom: 10px;

        .author {
          font-weight: bold;
          margin-right: 10px;
        }

        .time {
          font-size: 12px;
          color: #909399;
        }
      }

      .comment-content {
        margin-bottom: 10px;
        line-height: 1.5;
      }

      .comment-actions {
        text-align: right;
      }
    }

    .no-comments {
      text-align: center;
      padding: 20px;
      color: #909399;
    }
  }
}
</style>
