import { UserRelation } from '@/lib/types/relations'
import { alovaInstance } from '@/lib/services/request'

export const getContactList = () => {
  return alovaInstance.Get<UserRelation[]>('/user/contact/list', {
    meta: {
      authRole: 'auth'
    }
  })
}

export const addContact = (userId: string) => {
  return alovaInstance.Post(`/user/contact/${userId}`, undefined, {
    meta: {
      authRole: 'auth'
    }
  })
}

export const deleteContact = (userId: string) => {
  return alovaInstance.Delete(`/user/contact/${userId}`, {
    meta: {
      authRole: 'auth'
    }
  })
}
