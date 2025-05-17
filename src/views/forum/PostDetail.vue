<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { View, Delete, CaretTop, Star } from '@element-plus/icons-vue'
import { useUserStore, useForumStore } from '@/stores/index'
import { getForumDetail, getForumCommentsService } from '@/api/forum'
// 导入点赞、评论等相关接口
import {
  likePostService,
  unlikePostService,
  addCommentService,
  likeCommentService,
  unlikeCommentService,
  deleteCommentService,
  deletePostService
} from '@/api/forum'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const forumStore = useForumStore() // 引入论坛store

const userInfo = ref()
userInfo.value = userStore.userInfo

// 使用Pinia store管理帖子详情
const storePostDetail = computed(() => forumStore.currentPost || {})

// 获取文章详情（使用Pinia store管理状态）
const getPostDetailWithStore = async () => {
  const postId = route.params.id
  const res = await getForumDetail(postId)
  if (res.data.code === 0) {
    // 将数据存入store
    forumStore.setCurrentPost(res.data.data)
  } else {
    ElMessage.error(res.data.msg)
  }
}

onMounted(() => {
  getPostDetailWithStore()
})

// 评论列表
const comments = computed(() => forumStore.comments || [])

// 排序方式
const sortType = ref('time') // 'likes' or 'time'

// 获取帖子评论列表
const getForumComments = async () => {
  const postId = route.params.id
  const res = await getForumCommentsService(postId, sortType.value)
  if (res.data.code === 0) {
    forumStore.setComments(res.data.data)
  }
}

// 组件挂载时获取帖子评论列表
onMounted(() => {
  getForumComments()
})

// 新评论
const commentContent = ref('')
const commentCount = computed(() => comments.value ? comments.value.length : 0) // 评论总数

// 控制回复框显示
const replyingTo = ref({
  commentId: null,
  replyId: null,
  content: '',
  placeholder: '',
})

// 是否展开全部评论
const expandedComments = ref(false)
// 是否展开评论的回复
const expandedReplies = ref({})

// 根据排序方式获取评论
const sortedComments = computed(() => {
  if (!comments.value) return []
  const allComments = [...comments.value]
  if (sortType.value === 'hot') {
    // 按点赞数从多到少排序
    return allComments.sort((a, b) => b.likes - a.likes)
  } else {
    // 按回复时间排序，从新到旧
    return allComments.sort((a, b) => {
      // 将时间字符串转为时间戳进行比较
      const timeA = new Date(a.replyTime).getTime()
      const timeB = new Date(b.replyTime).getTime()
      return timeB - timeA
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

// 点赞评论
const likeComment = async (comment) => {
  // 检查用户是否登录
  if (!userStore.token) {
    ElMessage.warning('请先登录后再点赞')
    router.push('/login')
    return
  }

  try {
    const postId = route.params.id
    const commentId = comment.id

    if (comment.isLiked) {
      // 取消点赞
      const res = await unlikeCommentService(postId, commentId)
      if (res.data.code === 0) {
        comment.likes -= 1
        comment.isLiked = false
        ElMessage.success('已取消点赞')
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    } else {
      // 点赞
      const res = await likeCommentService(postId, commentId)
      if (res.data.code === 0) {
        comment.likes += 1
        comment.isLiked = true
        ElMessage.success('点赞成功')
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    }
  } catch (error) {
    console.error('点赞操作失败', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 发表评论
const submitComment = async () => {
  if (commentContent.value.trim() === '') {
    ElMessage.warning('评论内容不能为空')
    return
  }

  // 检查用户是否登录
  if (!userStore.token) {
    ElMessage.warning('请先登录后再评论')
    router.push('/login')
    return
  }

  try {
    const postId = route.params.id
    const res = await addCommentService(postId, {
      content: commentContent.value,
      parentId: null // 一级评论parentId为null
    })

    if (res.data.code === 0) {
      // 评论成功，重新获取评论列表
      await getForumComments()
      commentContent.value = ''
      ElMessage.success('评论发表成功')
    } else {
      ElMessage.error(res.data.msg || '评论发表失败')
    }
  } catch (error) {
    console.error('评论发表失败', error)
    ElMessage.error('评论发表失败，请稍后重试')
  }
}

// 删除评论
const deleteComment = (comment, parentComment = null) => {
  ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const postId = route.params.id
        const commentId = comment.id

        const res = await deleteCommentService(postId, commentId)

        if (res.data.code === 0) {
          if (parentComment) {
            // 删除回复
            const replyIndex = parentComment.children.findIndex((reply) => reply.id === comment.id)
            if (replyIndex !== -1) {
              parentComment.children.splice(replyIndex, 1)
            }
          } else {
            // 删除主评论，重新获取评论列表
            await getForumComments()
          }

          ElMessage.success('删除成功')
        } else {
          ElMessage.error(res.data.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除评论失败', error)
        ElMessage.error('删除失败，请稍后重试')
      }
    })
    .catch(() => {
      // 取消删除
    })
}

// 显示回复框
const showReplyBox = (comment, replyToComment = null) => {
  // 检查用户是否登录
  if (!userStore.token) {
    ElMessage.warning('请先登录后再回复')
    router.push('/login')
    return
  }

  let placeholder = `回复 ${comment.nickname}：`
  let commentId = comment.id
  let replyId = null

  if (replyToComment) {
    placeholder = `回复 ${replyToComment.nickname}：`
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
const submitReply = async (comment) => {
  if (!replyingTo.value.content.trim()) {
    ElMessage.warning('回复内容不能为空')
    return
  }

  try {
    const postId = route.params.id

    // 调用API提交回复
    const res = await addCommentService(postId, {
      content: replyingTo.value.content,
      parentId: replyingTo.value.commentId // 二级回复需要指定parentId
    })

    if (res.data.code === 0) {
      // 回复成功，重新获取评论列表
      await getForumComments()
      // 展开该评论的回复列表
      expandedReplies.value = {
        ...expandedReplies.value,
        [comment.id]: true
      }

      // 重置回复框
      cancelReply()

      ElMessage.success('回复成功')
    } else {
      ElMessage.error(res.data.msg || '回复失败')
    }
  } catch (error) {
    console.error('提交回复失败', error)
    ElMessage.error('回复失败，请稍后重试')
  }
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
  getForumComments() // 切换排序方式后重新获取评论
}

// 点赞文章
const likePost = async () => {
  // 检查用户是否登录
  if (!userStore.token) {
    ElMessage.warning('请先登录后再点赞')
    router.push('/login')
    return
  }

  try {
    const postId = route.params.id

    if (storePostDetail.value.isLiked) {
      // 已点赞，执行取消点赞
      const res = await unlikePostService(postId)
      if (res.data.code === 0) {
        // 更新状态
        const updatedPost = {
          ...storePostDetail.value,
          isLiked: false,
          likes: storePostDetail.value.likes - 1
        }
        forumStore.setCurrentPost(updatedPost)
        ElMessage.success('已取消点赞')
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    } else {
      // 未点赞，执行点赞操作
      const res = await likePostService(postId)
      if (res.data.code === 0) {
        // 更新状态
        const updatedPost = {
          ...storePostDetail.value,
          isLiked: true,
          likes: storePostDetail.value.likes + 1
        }
        forumStore.setCurrentPost(updatedPost)
        ElMessage.success('点赞成功')
      } else {
        ElMessage.error(res.data.msg || '操作失败')
      }
    }
  } catch (error) {
    console.error('点赞操作失败', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 删除帖子
const deletePost = () => {
  ElMessageBox.confirm('确定要删除这篇帖子吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const postId = route.params.id
        const res = await deletePostService(postId)

        if (res.data.code === 0) {
          ElMessage.success('帖子删除成功')
          // 删除成功后返回帖子列表页
          router.push('/forum')
        } else {
          ElMessage.error(res.data.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除帖子失败', error)
        ElMessage.error('删除失败，请稍后重试')
      }
    })
    .catch(() => {
      // 取消删除
    })
}
</script>

<template>
  <div class="post-detail-container">
    <div class="post-header" v-if="storePostDetail">
      <div class="post-info">
        <div class="author-info">
          <el-avatar :size="40" :src="storePostDetail.authorAvatar" class="author-avatar"></el-avatar>
          <div class="author-detail">
            <div class="author-name">{{ storePostDetail.author }}</div>
            <div class="publish-time">{{ storePostDetail.publishTime }}</div>
          </div>
        </div>
        <div class="post-meta">
          <div class="view-count">
            <el-icon><View /></el-icon>
            <span>{{ storePostDetail.views }} 次浏览</span>
          </div>
          <div class="like-count" @click="likePost" :class="{ 'is-liked': storePostDetail.isLiked }">
            <el-icon><Star /></el-icon>
            <span>{{ storePostDetail.likes }} 点赞</span>
          </div>
          <div v-auth="storePostDetail.author" class="delete-post">
            <el-button type="danger" size="small" @click="deletePost">
              <el-icon><Delete /></el-icon>
              删除帖子
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="post-content" v-if="storePostDetail">
      <h1 class="post-title">{{ storePostDetail.title }}</h1>
      <div class="content" v-html="storePostDetail.content"></div>

      <!-- 文章底部点赞区 -->
      <div class="post-action-bar">
        <el-button
          type="primary"
          :plain="!storePostDetail.isLiked"
          @click="likePost"
          class="like-button"
        >
          <el-icon><Star /></el-icon>
          {{ storePostDetail.isLiked ? '已点赞' : '点赞' }} {{ storePostDetail.likes }}
        </el-button>
      </div>
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
            <el-avatar :size="36" :src="comment.avatar">{{ comment.nickname[0] }}</el-avatar>
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="comment-author">{{ comment.nickname }}</span>
              <span class="comment-time">{{ comment.replyTime }}</span>
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
              <div v-auth="comment.nickname" class="comment-delete-wrapper">
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
            <div v-if="comment.children && comment.children.length" class="reply-list">
              <!-- 显示前3条回复或全部回复 -->
              <div
                v-for="reply in expandedReplies[comment.id]
                  ? comment.children
                  : comment.children.slice(0, 3)"
                :key="reply.id"
                class="reply-item"
              >
                <div class="reply-user">
                  <el-avatar :size="30" :src="reply.avatar">{{ reply.nickname[0] }}</el-avatar>
                </div>
                <div class="reply-content">
                  <div class="reply-header">
                    <span class="reply-author">{{ reply.nickname }}</span>
                    <span class="reply-time">{{ reply.replyTime }}</span>
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
                    <div v-auth="reply.nickname" class="reply-delete-wrapper">
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
                  comment.children.some((r) => r.id === replyingTo.replyId)
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
                v-if="comment.children.length > 3"
                class="view-more-replies"
                @click="toggleExpandReplies(comment.id)"
              >
                {{
                  expandedReplies[comment.id]
                    ? '收起回复'
                    : `查看全部 ${comment.children.length} 条回复`
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

.post-meta {
  display: flex;
  gap: 20px;
  align-items: center;
}

.view-count, .like-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #999;
  font-size: 14px;
}

.like-count {
  cursor: pointer;
}

.like-count:hover, .like-count.is-liked {
  color: #2b6fc2;
}

.delete-post {
  margin-left: 10px;
}

.delete-post :deep(.el-button) {
  display: flex;
  align-items: center;
}

.delete-post :deep(.el-icon) {
  margin-right: 4px;
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

.post-action-bar {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.like-button {
  padding: 10px 25px;
  font-size: 16px;
}

.like-button :deep(.el-icon) {
  margin-right: 8px;
}
</style>
