import request from '@/utils/request'

// 用户注册
export const authRegisterService = (data) => {
  return request({
    url: '/api/auth/register',
    method: 'post',
    data,
  })
}

// 用户登录
export const authLoginService = (data) => {
  return request({
    url: '/api/auth/login',
    method: 'post',
    data,
  })
}

// 忘记密码
export const authForgetPasswordService = (data) => {
  return request({
    url: '/user/forget-password',
    method: 'post',
    data,
  })
}

// 重置密码
export const authResetPasswordService = (data) => {
  return request({
    url: '/user/reset-password',
    method: 'post',
    data,
  })
}
