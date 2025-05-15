<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View, Delete, CaretTop } from '@element-plus/icons-vue'
// import { getForumDetail, getForumComments, createComment } from '@/api/forum'

const route = useRoute()
const router = useRouter()

// TODO: 调用API根据ID获取帖子详情
// 文章详情数据
const postDetail = ref({
  id: 1,
  title: '新手请教：如何选择适合自己的羽毛球拍？',
  author: '羽球新手',
  publishTime: '2024-03-15',
  views: 256,
  content: `
    <p>大家好，我是一名羽毛球初学者，最近想购买自己的第一支球拍，但是对球拍的选择不太了解，想请教一下各位前辈。</p>

    <p>我的情况是：</p>
    <ul>
      <li>身高175cm，体重65kg</li>
      <li>每周打2-3次球，每次1-2小时</li>
      <li>目前还在学习基本动作阶段</li>
      <li>预算在300-500元之间</li>
    </ul>

    <p>想请教的问题：</p>
    <ol>
      <li>对于初学者来说，应该选择什么重量的球拍？</li>
      <li>球拍平衡点应该选择头重还是头轻？</li>
      <li>这个价位有什么推荐的品牌和型号吗？</li>
      <li>购买时需要注意哪些参数？</li>
    </ol>

    <p>希望各位前辈能给出一些建议，谢谢！</p>
  `,
})

// TODO: 调用API获取帖子评论列表
// 评论列表
const comments = ref([
  {
    id: 1,
    author: 'WP',
    avatar: '',
    content: '太水了，诗人谢我吃，代码下了没？连个自己玩的demo都不放两张，就在这儿分享',
    publishTime: '1天前',
    likes: 0,
    isLiked: false,
  },
  {
    id: 2,
    author: '百万前端向前冲',
    avatar: '',
    content: '任何一个网页手绘？结果是canvas手绘风',
    publishTime: '15天前',
    likes: 1,
    isLiked: false,
    replies: [
      {
        id: 3,
        author: '米塔',
        content: '意思是自己手绘不是把某个网页元素直接变风格吗',
        publishTime: '13天前',
        likes: 0,
        isLiked: false,
      },
      {
        id: 4,
        author: '百万前端向前冲',
        content: '回复 米塔：对网页整体的风格如何变呢',
        publishTime: '13天前',
        likes: 0,
        isLiked: false,
      },
    ],
  },
  {
    id: 5,
    author: '羽球达人',
    avatar: '',
    content: '初学者推荐选择5U或4U重量的球拍，平衡点偏中杆或者头轻一些的比较容易控制',
    publishTime: '2天前',
    likes: 5,
    isLiked: false,
  },
  {
    id: 6,
    author: '球友一号',
    avatar: '',
    content: '300-500元价位推荐李宁或者威克多的入门级球拍，性价比很高',
    publishTime: '3天前',
    likes: 3,
    isLiked: false,
  },
  {
    id: 7,
    author: '教练指导',
    avatar: '',
    content: '购买时注意球拍的重量、平衡点和弹性，这三个参数最重要',
    publishTime: '4天前',
    likes: 8,
    isLiked: false,
  },
])

// 新评论
const commentContent = ref('')
const commentCount = ref(comments.value.length) // 评论总数

// 控制回复框显示
const replyingTo = ref({
  commentId: null,
  replyId: null,
  content: '',
  placeholder: '',
})

// 排序方式
const sortType = ref('hot') // 'hot' 或 'new'

// 是否展开全部评论
const expandedComments = ref(false)
// 是否展开评论的回复
const expandedReplies = ref({})

// 根据排序方式获取评论
const sortedComments = computed(() => {
  const allComments = [...comments.value]
  if (sortType.value === 'hot') {
    // 按点赞数从多到少排序
    return allComments.sort((a, b) => b.likes - a.likes)
  } else {
    // 按发布时间排序，这里假设 publishTime 已经是可比较的格式
    // 实际项目中，可能需要先将日期字符串转换为 Date 对象
    return allComments.sort((a, b) => {
      // 简化处理，假设最近的在前面
      if (a.publishTime.includes('刚刚')) return -1
      if (b.publishTime.includes('刚刚')) return 1

      // 提取天数并转为数字，小的天数（更近的日期）排在前面
      const daysA = parseInt(a.publishTime.match(/\d+/)[0] || 999)
      const daysB = parseInt(b.publishTime.match(/\d+/)[0] || 999)
      return daysA - daysB
    })
  }
})

// 分页后的评论列表
const displayedComments = computed(() => {
  if (expandedComments.value) {
    return sortedComments.value
  } else {
    return sortedComments.value.slice(0, 3)
  }
})

// 获取当前登录用户
const getCurrentUser = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) return null
  return JSON.parse(userInfoStr)
}

// 检查评论是否是当前用户发布的
const isCurrentUserComment = (author) => {
  const currentUser = getCurrentUser()
  return currentUser && currentUser.username === author
}

// 点赞评论
const likeComment = (comment) => {
  // TODO: 调用API更新评论点赞状态
  if (comment.isLiked) {
    comment.likes -= 1
  } else {
    comment.likes += 1
  }
  comment.isLiked = !comment.isLiked
}

// 发表评论
const submitComment = () => {
  if (commentContent.value.trim() === '') {
    ElMessage.warning('评论内容不能为空')
    return
  }

  // TODO: 调用API提交评论
  const newComment = {
    id: comments.value.length + 100, // 假设ID自增
    author: '当前用户',
    avatar: '',
    content: commentContent.value,
    publishTime: '刚刚',
    likes: 0,
    isLiked: false,
  }

  comments.value.unshift(newComment)
  commentContent.value = ''
  commentCount.value += 1

  ElMessage.success('评论发表成功')
}

// 删除评论
const deleteComment = (comment, parentComment = null) => {
  ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      if (parentComment) {
        // 删除回复
        const replyIndex = parentComment.replies.findIndex((reply) => reply.id === comment.id)
        if (replyIndex !== -1) {
          parentComment.replies.splice(replyIndex, 1)
        }
      } else {
        // 删除主评论
        const commentIndex = comments.value.findIndex((c) => c.id === comment.id)
        if (commentIndex !== -1) {
          comments.value.splice(commentIndex, 1)
          commentCount.value -= 1
        }
      }

      // TODO: 调用后端API删除评论
      console.log('删除评论:', comment.id)

      ElMessage({
        type: 'success',
        message: '删除成功',
      })
    })
    .catch(() => {
      // 取消删除
    })
}

// 显示回复框
const showReplyBox = (comment, replyToComment = null) => {
  let placeholder = `回复 ${comment.author}：`
  let commentId = comment.id
  let replyId = null

  if (replyToComment) {
    placeholder = `回复 ${replyToComment.author}：`
    commentId = replyToComment.id
    replyId = comment.id
  }

  replyingTo.value = {
    commentId,
    replyId,
    content: '',
    placeholder,
  }
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = {
    commentId: null,
    replyId: null,
    content: '',
    placeholder: '',
  }
}

// 提交回复
const submitReply = (comment) => {
  if (!replyingTo.value.content.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  // 获取用户信息，判断是否登录
  const userInfoStr = localStorage.getItem('userInfo')
  if (!userInfoStr) {
    ElMessage.warning('请先登录后再回复')
    router.push('/login')
    return
  }

  const userInfo = JSON.parse(userInfoStr)

  // 添加新回复
  const newReply = {
    id: Date.now(), // 使用时间戳作为临时ID
    author: userInfo.username || '匿名用户',
    avatar: userInfo.avatar || '',
    content: replyingTo.value.content,
    publishTime: '刚刚',
    likes: 0,
    isLiked: false,
  }

  // 确保评论有replies数组
  if (!comment.replies) {
    comment.replies = []
  }

  comment.replies.push(newReply)

  // TODO: 调用后端API提交回复
  console.log('提交回复:', newReply)

  // 重置回复框
  cancelReply()
}

// 切换评论展开状态
const toggleExpandComments = () => {
  expandedComments.value = !expandedComments.value
}

// 切换回复展开状态
const toggleExpandReplies = (commentId) => {
  expandedReplies.value = {
    ...expandedReplies.value,
    [commentId]: !expandedReplies.value[commentId],
  }
}

// 切换排序方式
const changeSortType = (type) => {
  sortType.value = type
}

// 获取文章详情
const getPostDetail = () => {
  const postId = route.params.id
  // TODO: 调用后端API获取文章详情
  console.log('获取文章ID：', postId)
}

onMounted(() => {
  getPostDetail()
})
</script>

<template>
  <div class="post-detail-container">
    <div class="post-header">
      <div class="post-info">
        <div class="author-info">
          <el-avatar :size="40" class="author-avatar">{{ postDetail.author[0] }}</el-avatar>
          <div class="author-detail">
            <div class="author-name">{{ postDetail.author }}</div>
            <div class="publish-time">{{ postDetail.publishTime }}</div>
          </div>
        </div>
        <div class="view-count">
          <el-icon><View /></el-icon>
          <span>{{ postDetail.views }} 次浏览</span>
        </div>
      </div>
    </div>

    <div class="post-content">
      <h1 class="post-title">{{ postDetail.title }}</h1>
      <div class="content" v-html="postDetail.content"></div>
    </div>

    <!-- 评论区 -->
    <div class="comment-section">
      <h3 class="comment-title">评论 {{ commentCount }}</h3>

      <!-- 评论输入框 -->
      <div class="comment-form">
        <div class="comment-input-container">
          <el-input
            v-model="commentContent"
            type="textarea"
            rows="3"
            placeholder="平等表达，友善交流"
            maxlength="1000"
            show-word-limit
          ></el-input>
        </div>
        <div class="comment-actions">
          <span class="word-count">{{ commentContent.length }} / 1000</span>
          <el-button type="primary" @click="submitComment">发送</el-button>
        </div>
      </div>

      <!-- 排序标签 -->
      <div class="comment-sort">
        <el-tabs v-model="sortType" @tab-change="changeSortType">
          <el-tab-pane label="最热" name="hot"></el-tab-pane>
          <el-tab-pane label="最新" name="new"></el-tab-pane>
        </el-tabs>
      </div>

      <!-- 评论列表 -->
      <div class="comment-list">
        <div v-for="comment in displayedComments" :key="comment.id" class="comment-item">
          <div class="comment-user">
            <el-avatar :size="36">{{ comment.author[0] }}</el-avatar>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ comment.author }}</span>
              <span class="comment-time">{{ comment.publishTime }}</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-footer">
              <div class="comment-actions">
                <span
                  class="comment-like"
                  @click="likeComment(comment)"
                  :class="{ 'is-liked': comment.isLiked }"
                >
                  <el-icon><CaretTop /></el-icon>
                  点赞 {{ comment.likes }}
                </span>
                <span class="comment-reply" @click="showReplyBox(comment)">回复</span>
              </div>
              <div v-if="isCurrentUserComment(comment.author)" class="comment-delete-wrapper">
                <span class="comment-delete" @click="deleteComment(comment)">
                  <el-icon><Delete /></el-icon>
                  删除
                </span>
              </div>
            </div>

            <!-- 回复输入框 -->
            <div
              v-if="replyingTo.commentId === comment.id && !replyingTo.replyId"
              class="reply-form"
            >
              <div class="reply-input-container">
                <el-input
                  v-model="replyingTo.content"
                  type="textarea"
                  rows="2"
                  :placeholder="replyingTo.placeholder"
                  maxlength="500"
                  show-word-limit
                ></el-input>
              </div>
              <div class="reply-actions">
                <span class="reply-word-count">{{ replyingTo.content.length }} / 500</span>
                <div class="reply-buttons">
                  <el-button size="small" @click="cancelReply">取消</el-button>
                  <el-button size="small" type="primary" @click="submitReply(comment)"
                    >回复</el-button
                  >
                </div>
              </div>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length" class="reply-list">
              <!-- 显示前3条回复或全部回复 -->
              <div
                v-for="reply in expandedReplies[comment.id]
                  ? comment.replies
                  : comment.replies.slice(0, 3)"
                :key="reply.id"
                class="reply-item"
              >
                <div class="reply-user">
                  <el-avatar :size="30">{{ reply.author[0] }}</el-avatar>
                </div>
                <div class="reply-content">
                  <div class="reply-header">
                    <span class="reply-author">{{ reply.author }}</span>
                    <span class="reply-time">{{ reply.publishTime }}</span>
                  </div>
                  <div class="reply-text">{{ reply.content }}</div>
                  <div class="reply-footer">
                    <div class="reply-actions">
                      <span
                        class="reply-like"
                        @click="likeComment(reply)"
                        :class="{ 'is-liked': reply.isLiked }"
                      >
                        点赞 {{ reply.likes }}
                      </span>
                      <span class="reply-button" @click="showReplyBox(reply, comment)">回复</span>
                    </div>
                    <div v-if="isCurrentUserComment(reply.author)" class="reply-delete-wrapper">
                      <span class="reply-delete" @click="deleteComment(reply, comment)">
                        <el-icon><Delete /></el-icon>
                        删除
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 回复输入框 (回复中的回复) -->
              <div
                v-if="
                  replyingTo.commentId &&
                  replyingTo.replyId &&
                  comment.replies.some((r) => r.id === replyingTo.replyId)
                "
                class="reply-form nested-reply-form"
              >
                <div class="reply-input-container">
                  <el-input
                    v-model="replyingTo.content"
                    type="textarea"
                    rows="2"
                    :placeholder="replyingTo.placeholder"
                    maxlength="500"
                    show-word-limit
                  ></el-input>
                </div>
                <div class="reply-actions">
                  <span class="reply-word-count">{{ replyingTo.content.length }} / 500</span>
                  <div class="reply-buttons">
                    <el-button size="small" @click="cancelReply">取消</el-button>
                    <el-button size="small" type="primary" @click="submitReply(comment)"
                      >回复</el-button
                    >
                  </div>
                </div>
              </div>

              <!-- 查看全部回复 -->
              <div
                v-if="comment.replies.length > 3"
                class="view-more-replies"
                @click="toggleExpandReplies(comment.id)"
              >
                {{
                  expandedReplies[comment.id]
                    ? '收起回复'
                    : `查看全部 ${comment.replies.length} 条回复`
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- 查看全部评论 -->
        <div
          v-if="sortedComments.length > 3"
          class="view-more-comments"
          @click="toggleExpandComments"
        >
          {{ expandedComments ? '收起评论' : `查看全部 ${commentCount} 条评论` }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  position: relative;
}

.back-button {
  margin-bottom: 15px;
}

.post-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.post-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.author-avatar {
  background-color: #2b6fc2;
  color: white;
  font-weight: bold;
}

.author-detail {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.publish-time {
  font-size: 14px;
  color: #999;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 14px;
}

.post-content {
  padding: 20px 0;
}

.post-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  line-height: 1.4;
}

.content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.content :deep(p) {
  margin-bottom: 15px;
}

.content :deep(ul),
.content :deep(ol) {
  margin-bottom: 15px;
  padding-left: 20px;
}

.content :deep(li) {
  margin-bottom: 8px;
}

.content :deep(h1),
.content :deep(h2),
.content :deep(h3),
.content :deep(h4),
.content :deep(h5),
.content :deep(h6) {
  margin: 20px 0 15px;
  color: #333;
  font-weight: bold;
}

.content :deep(img) {
  max-width: 100%;
  height: auto;
  margin: 15px 0;
  border-radius: 4px;
}

.content :deep(blockquote) {
  margin: 15px 0;
  padding: 10px 20px;
  border-left: 4px solid #2b6fc2;
  background-color: #f5f7fa;
  color: #666;
}

.content :deep(code) {
  background-color: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.content :deep(pre) {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 15px 0;
}

.content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

/* 评论区样式 */
.comment-section {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.comment-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.comment-form {
  margin-bottom: 30px;
}

.comment-input-container {
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-count {
  color: #999;
  font-size: 14px;
}

.comment-sort {
  margin-bottom: 20px;
}

.comment-sort :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.comment-sort :deep(.el-tabs__item) {
  font-size: 14px;
  padding: 0 20px 0 0;
}

.comment-list {
  margin-top: 20px;
}

.comment-item {
  display: flex;
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 1px solid #eee;
}

.comment-user {
  margin-right: 15px;
}

.comment-content {
  flex: 1;
  position: relative;
}

.comment-header {
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  margin-right: 10px;
  color: #333;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-text {
  margin-bottom: 10px;
  line-height: 1.6;
}

.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-actions,
.reply-actions {
  display: flex;
  gap: 15px;
  color: #999;
  font-size: 13px;
  align-items: center;
}

.comment-like,
.comment-reply,
.reply-like,
.reply-button {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
}

.comment-like:hover,
.comment-reply:hover,
.reply-like:hover,
.reply-button:hover {
  color: #2b6fc2;
}

.is-liked {
  color: #2b6fc2;
}

.comment-delete-wrapper,
.reply-delete-wrapper {
  display: flex;
  justify-content: flex-end;
}

.comment-delete,
.reply-delete {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  color: #f56c6c;
}

.comment-delete:hover,
.reply-delete:hover {
  opacity: 0.8;
}

/* 回复表单样式 */
.reply-form {
  margin-top: 15px;
  margin-bottom: 15px;
}

.reply-input-container {
  margin-bottom: 10px;
}

.reply-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-word-count {
  color: #999;
  font-size: 12px;
}

.reply-buttons {
  display: flex;
  gap: 10px;
}

.nested-reply-form {
  margin-top: 0;
  padding: 15px;
  background-color: #f0f2f5;
  border-radius: 4px;
}

/* 回复列表样式 */
.reply-list {
  margin-top: 15px;
  background-color: #f7f8fa;
  padding: 15px;
  border-radius: 4px;
}

.reply-item {
  display: flex;
  margin-bottom: 15px;
  position: relative;
}

.reply-item:last-child {
  margin-bottom: 0;
}

.reply-user {
  margin-right: 10px;
}

.reply-content {
  flex: 1;
}

.reply-header {
  margin-bottom: 5px;
}

.reply-author {
  font-weight: bold;
  margin-right: 10px;
  color: #333;
  font-size: 14px;
}

.reply-time {
  color: #999;
  font-size: 12px;
}

.reply-text {
  margin-bottom: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.reply-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-more-replies,
.view-more-comments {
  text-align: center;
  color: #2b6fc2;
  cursor: pointer;
  padding: 10px 0;
  font-size: 13px;
  background-color: #f7f8fa;
  border-radius: 4px;
  margin-top: 10px;
}

.view-more-comments {
  background-color: transparent;
  border: 1px dashed #dcdfe6;
}

.view-more-replies:hover,
.view-more-comments:hover {
  background-color: #f0f2f5;
}
</style>
