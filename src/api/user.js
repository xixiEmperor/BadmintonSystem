import request from '@/utils/request'

/**
 * 获取用户个人信息
 * @returns {Promise<Object>} 用户个人信息
 */
export const getUserInfoService = (token) => {
  // TODO: 将用户信息保存到Pinia store中
  return request({
    url: '/api/user/info',
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

/**
 * 更新用户个人信息
 * @param {Object} profileData - 用户信息
 * @param {string} [profileData.nickname] - 昵称
 * @param {string} [profileData.phone] - 手机号码
 * @param {string} [profileData.bio] - 个人简介
 * @param {string} [profileData.gender] - 性别
 * @param {string} [profileData.birthday] - 生日
 * @param {string} [profileData.location] - 所在地
 * @returns {Promise<Object>} 更新后的用户信息
 */
export function updateUserProfile(profileData) {
  // TODO: 更新成功后，更新Pinia store中的用户信息
  return request.put('/user/profile', profileData)
}

/**
 * 上传用户头像
 * @param {FormData} formData - 包含头像文件的表单数据
 * @returns {Promise<Object>} 上传结果
 */
export function uploadAvatar(formData) {
  // TODO: 上传成功后，更新Pinia store中的用户头像信息
  return request.post('/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 修改用户密码
 * @param {Object} passwordData - 密码数据
 * @param {string} passwordData.oldPassword - 旧密码
 * @param {string} passwordData.newPassword - 新密码
 * @returns {Promise<Object>} 修改结果
 */
export function changePassword(passwordData) {
  return request.put('/user/password', passwordData)
}

/**
 * 获取用户预约记录
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 预约状态(pending/paid/cancelled/all)
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 * @returns {Promise<Object>} 用户预约列表
 */
export function getUserBookings(params = {}) {
  // TODO: 考虑将预约记录保存到专门的Pinia store中
  return request.get('/user/bookings', {
    params: {
      status: params.status || 'all',
      page: params.page || 1,
      pageSize: params.pageSize || 10,
    },
  })
}

/**
 * 获取预约详情
 * @param {number} id - 预约ID
 * @returns {Promise<Object>} 预约详情
 */
export function getBookingDetail(id) {
  return request.get(`/user/bookings/${id}`)
}

/**
 * 取消预约
 * @param {number} id - 预约ID
 * @returns {Promise<Object>} 取消结果
 */
export function cancelBooking(id) {
  // TODO: 取消成功后，更新Pinia store中的预约记录
  return request.post(`/user/bookings/${id}/cancel`)
}

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.email - 邮箱
 * @returns {Promise}
 */
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data,
  })
}

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise}
 */
export function login(data) {
  // TODO: 登录成功后，保存token和用户信息到Pinia store中
  return request({
    url: '/user/login',
    method: 'post',
    data,
  })
}

/**
 * 忘记密码
 * @param {Object} data - 忘记密码信息
 * @param {string} data.email - 邮箱
 * @returns {Promise}
 */
export function forgetPassword(data) {
  return request({
    url: '/user/forget-password',
    method: 'post',
    data,
  })
}

/**
 * 重置密码
 * @param {Object} data - 重置密码信息
 * @param {string} data.token - 重置密码令牌
 * @param {string} data.newPassword - 新密码
 * @returns {Promise}
 */
export function resetPassword(data) {
  return request({
    url: '/user/reset-password',
    method: 'post',
    data,
  })
}

export default {
  register,
  login,
  forgetPassword,
  resetPassword,
}
