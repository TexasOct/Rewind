import { Message, MessageQuery } from '@/lib/types/messages'
import { alovaInstance } from '@/lib/services/request'

export const getMessages = (query: MessageQuery) => {
  return alovaInstance.Get<Message[]>('/message', {
    params: query,
    meta: {
      authRole: 'auth'
    }
  })
}
