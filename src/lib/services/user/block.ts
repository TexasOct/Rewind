import { alovaInstance } from '@/lib/services/request'

export const getBlockList = () => {
  return alovaInstance.Get('/user/block/list', {
    meta: {
      authRole: 'auth'
    }
  })
}

export const addBlock = (userId: string) => {
  return alovaInstance.Post(`/user/block/${userId}`, {
    meta: {
      authRole: 'auth'
    }
  })
}

export const deleteBlock = (userId: string) => {
  return alovaInstance.Delete(`/user/block/${userId}`, {
    meta: {
      authRole: 'auth'
    }
  })
}
