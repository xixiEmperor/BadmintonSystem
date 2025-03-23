import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useForumStore = defineStore(
  'forum',
  () => {
    // 论坛帖子列表
    const posts = ref([])

    // 分类列表
    const categories = ref([])

    // 热门帖子
    const hotPosts = ref([])

    // 设置帖子列表
    const setPosts = (postList) => {
      posts.value = postList
    }

    // 设置分类列表
    const setCategories = (categoryList) => {
      categories.value = categoryList
    }

    // 设置热门帖子
    const setHotPosts = (hotPostList) => {
      hotPosts.value = hotPostList
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
    }

    // 删除帖子
    const deletePost = (postId) => {
      const index = posts.value.findIndex((post) => post.id === postId)
      if (index !== -1) {
        posts.value.splice(index, 1)
      }
    }

    return {
      posts,
      categories,
      hotPosts,
      setPosts,
      setCategories,
      setHotPosts,
      addPost,
      updatePost,
      deletePost,
    }
  },
  {
    persist: true, // 持久化存储论坛数据
  },
)
