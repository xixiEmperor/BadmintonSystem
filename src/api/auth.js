import request from '@/utils/request'

/**
 * 用户注册
 * @param {Object} data - 注册信息
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @param {string} data.email - 邮箱
 * @returns {Promise}
 */
export const authRegisterService = (data) => {
  return request({
    url: '/api/auth/register',
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
export const authLoginService = (data) => {
  return request({
    url: '/api/auth/login',
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
export const authForgetPasswordService = (data) => {
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
export const authResetPasswordService = (data) => {
  return request({
    url: '/user/reset-password',
    method: 'post',
    data,
  })
}
