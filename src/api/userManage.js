import request from '@/utils/request'

/**
 * 分页查询用户列表
 * @param {Object} params - 查询参数
 * @param {string} [params.keyword] - 用户名搜索关键词（可选）
 * @param {string} [params.role] - 角色过滤（可选，如：ROLE_USER, ROLE_ADMIN）
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise<Object>} 分页用户列表
 */
export function getUserList(params = {}) {
  return request({
    url: '/api/user/admin/users',
    method: 'get',
    params: {
      keyword: params.keyword,
      role: params.role,
      page: params.page || 1,
      size: params.size || 10,
    },
  })
}

/**
 * 重置用户密码
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 重置结果
 */
export function resetUserPassword(userId) {
  return request({
    url: `/api/user/admin/users/${userId}/reset-password`,
    method: 'put',
  })
}

/**
 * 获取用户详细信息
 * @param {number} userId - 用户ID
 * @returns {Promise<Object>} 用户详细信息
 */
export function getUserDetail(userId) {
  return request({
    url: `/api/user/admin/users/${userId}`,
    method: 'get',
  })
}

/**
 * 搜索用户（按用户名模糊搜索）
 * @param {Object} params - 搜索参数
 * @param {string} params.keyword - 搜索关键词
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise<Object>} 搜索结果
 */
export function searchUsers(params) {
  return getUserList({
    keyword: params.keyword,
    page: params.page || 1,
    size: params.size || 10,
  })
}

/**
 * 按角色查询用户
 * @param {Object} params - 查询参数
 * @param {string} params.role - 用户角色（ROLE_USER, ROLE_ADMIN）
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise<Object>} 查询结果
 */
export function getUsersByRole(params) {
  return getUserList({
    role: params.role,
    page: params.page || 1,
    size: params.size || 10,
  })
}

/**
 * 组合搜索用户（支持关键词和角色同时过滤）
 * @param {Object} params - 搜索参数
 * @param {string} [params.keyword] - 搜索关键词
 * @param {string} [params.role] - 用户角色
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.size=10] - 每页数量
 * @returns {Promise<Object>} 搜索结果
 */
export function searchUsersAdvanced(params) {
  return getUserList(params)
}

export default {
  getUserList,
  resetUserPassword,
  getUserDetail,
  searchUsers,
  getUsersByRole,
  searchUsersAdvanced,
}
