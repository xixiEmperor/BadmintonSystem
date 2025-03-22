import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果返回的状态码不是200，说明接口请求有误
    if (res.code !== 200) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000,
      })

      // 如果返回401，说明token已经过期，需要重新登录
      if (res.code === 401) {
        // 清除本地token
        localStorage.removeItem('token')
        // 重定向到登录页
        setTimeout(() => {
          window.location.href = '/login'
        }, 1500)
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res.data
    }
  },
  (error) => {
    console.error('响应错误', error)
    let message = '网络错误，请稍后重试'

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = '未授权，请登录'
          // 清除本地token
          localStorage.removeItem('token')
          // 重定向到登录页
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址出错'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `连接错误${error.response.status}`
      }
    }

    ElMessage({
      message: message,
      type: 'error',
      duration: 3000,
    })

    return Promise.reject(error)
  },
)

export default instance
