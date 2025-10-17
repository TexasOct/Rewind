import { alovaInstance } from '@/lib/services/request'
import { UserProfile } from '@/lib/types/profile'

export const getUserInfo = (params?: { target_id: string }) => {
  return alovaInstance.Get<UserProfile>('/user/info', {
    params,
    meta: {
      authRole: 'auth'
    }
  })
}

export const updateUserInfo = (data: any) => {
  return alovaInstance.Post<UserProfile>('/user/info', data, {
    meta: {
      authRole: 'auth'
    }
  })
}
