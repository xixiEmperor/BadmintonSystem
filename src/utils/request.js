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

// axios请求拦截器
axios.interceptors.request.use(
  (config) => {
    // 添加token等操作
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// axios响应拦截器
axios.interceptors.response.use(
  (response) => {
    // 这里需要判断code值，而不是HTTP状态码
    if (response.data.code === 0) {
      // 业务成功的情况
      return response.data
    } else {
      // 业务失败的情况，虽然HTTP状态是200，但业务状态是失败
      ElMessage.error(response.data.message || '请求失败')
      return Promise.reject(response.data)
    }
  },
  (error) => {
    // 这里处理HTTP层面的错误
    ElMessage.error('网络错误，请稍后重试')
    return Promise.reject(error)
  },
)

export default instance
