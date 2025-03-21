import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 根据实际项目配置
  timeout: 5000, // 请求超时时间
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 根据后端约定的状态码，判断请求是否成功
    if (res.code !== 200) {
      // 处理错误情况
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  (error) => {
    return Promise.reject(error)
  },
)

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
