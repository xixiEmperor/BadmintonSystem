import request from '@/utils/request'

// 发送验证码
export const authSendCodeService = (data) => {
  return request({
    url: '/api/auth/send-code',
    method: 'post',
    data,
  })
}

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
  // TODO: 登录成功后，将token和用户信息保存到Pinia store中
  return request({
    url: '/api/auth/login',
    method: 'post',
    data,
  })
}

// 忘记密码（已废弃，使用发送验证码接口）
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
    url: '/api/auth/reset-password',
    method: 'post',
    data,
  })
}
