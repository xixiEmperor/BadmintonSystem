import request from '@/utils/request'

/**
 * 获取用户个人信息
 * @returns {Promise<Object>} 用户个人信息
 */
export function getUserProfile() {
  return request.get('/user/profile')
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
  return request.put('/user/profile', profileData)
}

/**
 * 上传用户头像
 * @param {FormData} formData - 包含头像文件的表单数据
 * @returns {Promise<Object>} 上传结果
 */
export function uploadAvatar(formData) {
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
  return request.post(`/user/bookings/${id}/cancel`)
}
