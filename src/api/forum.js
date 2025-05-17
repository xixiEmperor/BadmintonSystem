import request from '@/utils/request'

// 获取论坛帖子列表
export function getForumList(params) {
  return request({
    url: '/api/forum/posts',
    method: 'get',
    params
  })
}

// 获取论坛帖子详情
export function getForumDetail(postId) {
  return request({
    url: '/api/forum/posts/detail',
    method: 'get',
    params: { postId }
  })
}

// 获取帖子回复
export function getForumCommentsService(postId, orderBy) {
  return request({
    url: `/api/forum/posts/${postId}/replies`,
    method: 'get',
    params: { orderBy }
  })
}

// 点赞帖子
export function likePostService(postId) {
  return request({
    url: `/api/forum/posts/${postId}/like`,
    method: 'post'
  })
}

// 取消点赞帖子
export function unlikePostService(postId) {
  return request({
    url: `/api/forum/posts/${postId}/like`,
    method: 'delete'
  })
}

// 发布帖子
export function createPost(data) {
  return request.post('/api/forum/posts/create', data)
}

// 添加评论/回复
export function addCommentService(postId, data) {
  return request({
    url: `/api/forum/posts/${postId}/replies`,
    method: 'post',
    data
  })
}

// 删除评论/回复
export function deleteCommentService(postId, replyId) {
  return request({
    url: `/api/forum/posts/${postId}/replies/${replyId}`,
    method: 'delete'
  })
}

// 点赞评论
export function likeCommentService(postId, replyId) {
  return request({
    url: `/api/forum/posts/${postId}/replies/${replyId}/like`,
    method: 'post'
  })
}

// 取消点赞评论
export function unlikeCommentService(postId, replyId) {
  return request({
    url: `/api/forum/posts/${postId}/replies/${replyId}/like`,
    method: 'delete'
  })
}

// 删除帖子
export function deletePostService(postId) {
  return request({
    url: `/api/forum/posts/${postId}`,
    method: 'delete'
  })
}

// 获取用户发帖列表
export function getUserPosts(params) {
  return request({
    url: '/api/forum/posts/user',
    method: 'get',
    params
  })
}




