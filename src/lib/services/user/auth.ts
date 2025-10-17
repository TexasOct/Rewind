import { UserProfile } from '@/lib/types/profile'
import { alovaInstance } from '@/lib/services/request'

// 登录
export const login = (data: { email: string; password: string; device_id: string; platform: string }) => {
  return alovaInstance.Post<{
    user: UserProfile
    token: string
    refresh_token: string
  }>('/user/auth/login', data, {
    meta: {
      authRole: 'login'
    }
  })
}

// 登出
export const logout = () => {
  return alovaInstance.Post('/user/auth/logout', undefined, {
    meta: {
      authRole: 'logout'
    }
  })
}

// 注册
export const register = (data: { username: string; email: string; password: string; code: string }) => {
  return alovaInstance.Post('/user/auth/register', data, {
    meta: {
      authRole: 'noAuth'
    }
  })
}

// 获取注册验证码
export const getRegisterVerifyCode = (data: { email: string }) => {
  return alovaInstance.Post('/user/auth/register/verify-code', data, {
    meta: {
      authRole: 'noAuth'
    }
  })
}

// 重置密码
export const resetPassword = (data: { email: string; password: string; code: string }) => {
  return alovaInstance.Post('/user/auth/password/reset', data, {
    meta: {
      authRole: 'noAuth'
    }
  })
}

// 获取重置密码验证码
export const getResetPasswordVerifyCode = (data: { email: string }) => {
  return alovaInstance.Post('/user/auth/password/reset/verify-code', data, {
    meta: {
      authRole: 'noAuth'
    }
  })
}

export const refreshToken = () => {
  return alovaInstance.Post<{
    token: string
    refresh_token: string
  }>('/user/auth/refresh-token', undefined, {
    meta: {
      authRole: 'refreshToken'
    }
  })
}
