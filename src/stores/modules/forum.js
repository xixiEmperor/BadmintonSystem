import { defineStore } from 'pinia'
import { ref } from 'vue'
import { formatDateTime } from '@/utils/format'

export const useForumStore = defineStore(
  'forum',
  () => {
    // 论坛帖子列表
    const posts = ref()

    // 当前查看的帖子详情
    const currentPost = ref(null)

    // 热门帖子
    const hotPosts = ref()

    // 设置帖子列表
    const setPosts = (postList) => {
      // 确保日期格式一致性
      if (postList && postList.length > 0) {
        posts.value = postList.map(post => {
          if (post.publishTime && !post.publishTime.includes('-')) {
            post.publishTime = formatDateTime(post.publishTime)
          }
          if (post.lastReply && !post.lastReply.includes('-')) {
            post.lastReply = formatDateTime(post.lastReply)
          }
          return post
        })
      } else {
        posts.value = postList
      }
    }

    // 设置热门帖子
    const setHotPosts = (hotPostList) => {
      hotPosts.value = hotPostList
    }

    // 设置当前查看的帖子详情
    const setCurrentPost = (post) => {
      if (post && post.publishTime && !post.publishTime.includes('-')) {
        post.publishTime = formatDateTime(post.publishTime)
      }
      currentPost.value = post
    }

    // 添加新帖子
    const addPost = (post) => {
      posts.value.unshift(post)
    }

    // 更新帖子
    const updatePost = (updatedPost) => {
      const index = posts.value.findIndex((post) => post.id === updatedPost.id)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }

      // 如果当前查看的就是被更新的帖子，也更新详情
      if (currentPost.value && currentPost.value.id === updatedPost.id) {
        setCurrentPost(updatedPost)
      }
    }

    // 删除帖子
    const deletePost = (postId) => {
      const index = posts.value.findIndex((post) => post.id === postId)
      if (index !== -1) {
        posts.value.splice(index, 1)
      }

      // 如果当前查看的就是被删除的帖子，清空详情
      if (currentPost.value && currentPost.value.id === postId) {
        currentPost.value = null
      }
    }

    // 帖子评论列表
    const comments = ref([])

    // 设置帖子评论列表
    const setComments = (commentList) => {
      comments.value = commentList
    }

    return {
      posts,
      currentPost,
      hotPosts,
      setPosts,
      setHotPosts,
      setCurrentPost,
      addPost,
      updatePost,
      deletePost,
      comments,
      setComments,
    }
  },
  {
    persist: true, // 持久化存储论坛数据
  },
)
