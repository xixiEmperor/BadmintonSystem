import request from '@/utils/request'

// 获取论坛帖子列表
export const getForumList = (data) => {
  return request.get('/api/forum/posts', {
    params: data
  })
}

// 获取论坛帖子详情
export const getForumDetail = (postId) => {
  return request.get('/api/forum/posts/detail', {
    params: { postId }
  })
}

// 获取帖子评论
export const getForumComments = (postId, sortType = 'new') => {
  return request.get('/api/forum/comments', {
    params: { postId, sortType }
  })
}

// 发布评论
export const createComment = (data) => {
  return request.post('/api/forum/comments/create', data)
}

// 点赞评论
export const likeComment = (commentId, action) => {
  return request.post('/api/forum/comments/like', {
    commentId,
    action
  })
}

// 发布帖子
export const createPost = (data) => {
  return request.post('/api/forum/posts/create', data)
}




